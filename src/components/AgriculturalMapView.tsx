import React, { useEffect, useRef, useState } from 'react';
import { Barangay, CropType, SuitabilityLevel } from '@/types/agricultural';
import L from 'leaflet';
import * as esri from 'esri-leaflet';
import 'leaflet/dist/leaflet.css';

interface AgriculturalMapViewProps {
  barangays: Barangay[];
  selectedCrop: CropType | 'all';
  onSelectBarangay: (barangay: Barangay) => void;
}

export const AgriculturalMapView = ({ barangays, selectedCrop, onSelectBarangay }: AgriculturalMapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const psaLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [psaLayerLoaded, setPsaLayerLoaded] = useState(false);

  // Iligan City center coordinates
  const iliganCity = {
    lat: 8.228, 
    lng: 124.2452
  };

  // Color mapping for suitability levels
  const getSuitabilityColor = (level: SuitabilityLevel): string => {
    switch (level) {
      case 'highly-suitable': return '#22c55e'; // Green
      case 'moderately-suitable': return '#eab308'; // Yellow
      case 'low-suitable': return '#f97316'; // Orange
      case 'not-suitable': return '#ef4444'; // Red
      default: return '#94a3b8'; // Gray
    }
  };

  // Get boundary source display text
  const getBoundarySourceDisplay = (): string => {
    return psaLayerLoaded ? 'PSA ArcGIS REST Service' : 'Loading PSA boundaries...';
  };

  // Get suitability level for a barangay and crop
  const getBarangaySuitability = React.useCallback((barangay: Barangay, crop: CropType | 'all'): { level: SuitabilityLevel; area: number } => {
    if (crop === 'all') {
      // Find the best suitability across all crops
      let bestLevel: SuitabilityLevel = 'not-suitable';
      let totalArea = 0;
      
      for (const suitability of barangay.suitabilityData) {
        totalArea += suitability.suitableArea;
        if (suitability.suitabilityLevel === 'highly-suitable' && bestLevel !== 'highly-suitable') {
          bestLevel = 'highly-suitable';
        } else if (suitability.suitabilityLevel === 'moderately-suitable' && bestLevel === 'not-suitable') {
          bestLevel = 'moderately-suitable';
        }
      }
      
      return { level: bestLevel, area: totalArea };
    }
    
    const cropSuitability = barangay.suitabilityData.find(s => s.crop === crop);
    return cropSuitability 
      ? { level: cropSuitability.suitabilityLevel, area: cropSuitability.suitableArea }
      : { level: 'not-suitable', area: 0 };
  }, []);


  // Memoized function to find matching barangay
  const findMatchingBarangay = React.useCallback((brgyName: string) => {
    return barangays.find(b => 
      b.name.toLowerCase() === brgyName?.toLowerCase() ||
      b.name.toLowerCase().includes(brgyName?.toLowerCase()) ||
      brgyName?.toLowerCase().includes(b.name.toLowerCase())
    );
  }, [barangays]);

  // Click handler for PSA layer
  const handlePSALayerClick = React.useCallback((e: any) => {
    const feature = e.layer.feature;
    const matchingBarangay = findMatchingBarangay(feature.properties.brgy_name);

    if (matchingBarangay) {
      onSelectBarangay(matchingBarangay);
    }
  }, [findMatchingBarangay, onSelectBarangay]);

  // Popup handler for PSA layer
  const getPSALayerPopup = React.useCallback((layer: any) => {
    const feature = layer.feature;
    const matchingBarangay = findMatchingBarangay(feature.properties.brgy_name);

    if (matchingBarangay) {
      const suitability = getBarangaySuitability(matchingBarangay, selectedCrop as CropType);
      const cropInfo = selectedCrop === 'all' 
        ? `Total Suitable Area: ${suitability.area.toFixed(1)} ha`
        : `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Suitable: ${suitability.area.toFixed(1)} ha`;
        
      const matchInfo = matchingBarangay.matchedArea 
        ? `<br><strong>Matched Zone: ${matchingBarangay.matchedArea} ha</strong>`
        : '';

      return `<div class="text-sm">
        <strong>${matchingBarangay.name}</strong><br>
        PSA Code: ${feature.properties.brgy_code || 'N/A'}<br>
        Total Area: ${matchingBarangay.totalArea.toFixed(1)} ha<br>
        Agricultural Area: ${matchingBarangay.agriculturalArea.toFixed(1)} ha<br>
        ${cropInfo}<br>
        Available Land: ${matchingBarangay.availableLand} ha<br>
        Active Demands: ${matchingBarangay.activeDemands}${matchInfo}
      </div>`;
    }

    return `<div class="text-sm">
      <strong>${feature.properties.brgy_name || 'Unknown Barangay'}</strong><br>
      PSA Code: ${feature.properties.brgy_code || 'N/A'}<br>
      <em>No agricultural data available</em>
    </div>`;
  }, [findMatchingBarangay, getBarangaySuitability, selectedCrop]);

  // Get style for a specific feature and crop (stable function)
  const getFeatureStyle = React.useCallback((feature: any, crop: CropType | 'all') => {
    const matchingBarangay = findMatchingBarangay(feature.properties.brgy_name);

    if (matchingBarangay) {
      const suitability = getBarangaySuitability(matchingBarangay, crop);
      let fillColor = getSuitabilityColor(suitability.level);
      let strokeColor = fillColor;
      let fillOpacity = 0.6;

      // Special styling for matched zones
      if (matchingBarangay.matchedArea && matchingBarangay.matchedArea > 0) {
        fillColor = '#8b5cf6'; // Purple for matched zones
        strokeColor = '#7c3aed';
        fillOpacity = 0.8;
      }

      return {
        fillColor: fillColor,
        weight: 2,
        opacity: 1,
        color: strokeColor,
        fillOpacity: fillOpacity
      };
    }

    // Default styling for unmatched barangays - completely transparent
    return {
      fillColor: '#94a3b8',
      weight: 0,
      opacity: 0,
      color: '#64748b',
      fillOpacity: 0
    };
  }, [findMatchingBarangay, getBarangaySuitability, getSuitabilityColor]);

  // Load PSA ArcGIS REST service layer (stable - no crop dependency)
  const loadPSABoundaries = React.useCallback(() => {
    if (!mapRef.current) return;

    // Remove existing PSA layer if it exists
    if (psaLayerRef.current) {
      psaLayerRef.current.remove();
    }

    try {
      // PSA ArcGIS REST service URL for Barangay boundaries
      // Start with default styling that will be updated later
      psaLayerRef.current = esri.featureLayer({
        url: 'https://portal.georisk.gov.ph/arcgis/rest/services/PSA/Barangay/MapServer/4',
        style: function(feature: any) {
          // Default basic styling - will be updated by useEffect
          return {
            fillColor: '#94a3b8',
            weight: 1,
            opacity: 0.3,
            color: '#64748b',
            fillOpacity: 0.2
          };
        }
      });

      // Add event listeners (these won't change unless handlers change)
      psaLayerRef.current.on('click', handlePSALayerClick);
      psaLayerRef.current.bindPopup(getPSALayerPopup);

      psaLayerRef.current.addTo(mapRef.current);
      
      // Set loaded state after layer is added
      psaLayerRef.current.on('load', () => {
        setPsaLayerLoaded(true);
      });

      console.log('PSA ArcGIS layer loaded successfully');
    } catch (error) {
      console.error('Failed to load PSA boundaries:', error);
      setPsaLayerLoaded(false);
    }
  }, [handlePSALayerClick, getPSALayerPopup]);


  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([iliganCity.lat, iliganCity.lng], 12);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Move zoom control to bottom right
    mapRef.current.zoomControl.remove();
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    // Add scale control to bottom left
    L.control.scale({ position: 'bottomleft' }).addTo(mapRef.current);

    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load PSA boundaries when component mounts or barangays change
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Load PSA boundaries
    loadPSABoundaries();
  }, [barangays, isLoading, loadPSABoundaries]);

  // Update layer styling when selectedCrop or psaLayerLoaded changes
  useEffect(() => {
    if (!psaLayerRef.current || !mapRef.current || !psaLayerLoaded) return;

    // Create a style function for this specific crop
    const currentCropStyleFunction = (feature: any) => getFeatureStyle(feature, selectedCrop);
    
    // Just update the styling of existing layer
    psaLayerRef.current.setStyle(currentCropStyleFunction);
  }, [selectedCrop, getFeatureStyle, psaLayerLoaded]);

  return (
    <div className="fixed inset-0 z-0">
      <div className="relative w-full h-full bg-muted/30">
        {(isLoading || !psaLayerLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/75 z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading PSA boundaries...</p>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="absolute inset-0"></div>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-20 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[400] border">
          <div className="text-sm font-semibold mb-3 text-foreground">
            {selectedCrop === 'all' ? 'Overall Suitability' : `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Suitability`}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Source: {getBoundarySourceDisplay()}
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <span className="text-xs text-foreground">Highly Suitable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
              <span className="text-xs text-foreground">Moderately Suitable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <span className="text-xs text-foreground">Low Suitable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-xs text-foreground">Not Suitable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="text-xs text-foreground">Matched Zone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriculturalMapView;