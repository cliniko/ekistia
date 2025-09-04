import React, { useEffect, useRef, useState } from 'react';
import { Barangay, CropType, SuitabilityLevel } from '@/types/agricultural';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AgriculturalMapViewProps {
  barangays: Barangay[];
  selectedCrop: CropType | 'all';
  onSelectBarangay: (barangay: Barangay) => void;
}

export const AgriculturalMapView = ({ barangays, selectedCrop, onSelectBarangay }: AgriculturalMapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{[key: string]: L.Polygon}>({});
  const [isLoading, setIsLoading] = useState(true);

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

  // Get suitability level for a barangay and crop
  const getBarangaySuitability = (barangay: Barangay, crop: CropType): { level: SuitabilityLevel; area: number } => {
    if (selectedCrop === 'all') {
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
  };

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

  // Update barangay polygons when data or selected crop changes
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Clear existing layers
    Object.values(layersRef.current).forEach(layer => layer.remove());
    layersRef.current = {};

    // Add polygons for barangays
    barangays.forEach(barangay => {
      try {
        const suitability = getBarangaySuitability(barangay, selectedCrop as CropType);
        let fillColor = getSuitabilityColor(suitability.level);
        let strokeColor = fillColor;
        let fillOpacity = 0.6;

        // Special styling for matched zones
        if (barangay.matchedArea && barangay.matchedArea > 0) {
          fillColor = '#8b5cf6'; // Purple for matched zones
          strokeColor = '#7c3aed';
          fillOpacity = 0.8;
        }

        const polygon = L.polygon(
          barangay.coordinates.map(coord => [coord[1], coord[0]]), // Leaflet uses [lat, lng]
          {
            fillColor: fillColor,
            weight: 2,
            opacity: 1,
            color: strokeColor,
            fillOpacity: fillOpacity
          }
        ).addTo(mapRef.current!);

        polygon.on('click', () => {
          onSelectBarangay(barangay);
        });

        polygon.on('mouseover', function(e) {
          this.setStyle({
            weight: 3,
            fillOpacity: 0.8
          });
          
          // Create popup content
          const cropInfo = selectedCrop === 'all' 
            ? `Total Suitable Area: ${suitability.area.toFixed(1)} ha`
            : `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Suitable: ${suitability.area.toFixed(1)} ha`;
            
          const matchInfo = barangay.matchedArea 
            ? `<br><strong>Matched Zone: ${barangay.matchedArea} ha</strong>`
            : '';

          this.bindPopup(
            `<div class="text-sm">
              <strong>${barangay.name}</strong><br>
              Total Area: ${barangay.totalArea.toFixed(1)} ha<br>
              Agricultural Area: ${barangay.agriculturalArea.toFixed(1)} ha<br>
              ${cropInfo}<br>
              Available Land: ${barangay.availableLand} ha<br>
              Active Demands: ${barangay.activeDemands}${matchInfo}
            </div>`
          ).openPopup();
        });

        polygon.on('mouseout', function(e) {
          this.setStyle({
            weight: 2,
            fillOpacity: barangay.matchedArea ? 0.8 : 0.6
          });
        });

        // Add tooltip
        polygon.bindTooltip(`${barangay.name} - ${suitability.level.replace('-', ' ').toUpperCase()}`);

        layersRef.current[barangay.id] = polygon;
      } catch (error) {
        console.error("Error adding barangay polygon:", error);
      }
    });
  }, [barangays, selectedCrop, isLoading, onSelectBarangay]);

  return (
    <div className="fixed inset-0 z-0">
      <div className="relative w-full h-full bg-muted/30">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/75 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        <div ref={mapContainerRef} className="absolute inset-0"></div>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-20 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[400] border">
          <div className="text-sm font-semibold mb-3 text-foreground">
            {selectedCrop === 'all' ? 'Overall Suitability' : `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Suitability`}
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