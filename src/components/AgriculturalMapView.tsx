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

  // Normalize barangay names for robust matching
  const normalizeName = React.useCallback((name?: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\b(brgy\.|brgy|barangay)\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // Extract barangay name from PSA feature properties (handles different schemas)
  const getPSAFeatureBarangayName = React.useCallback((props: any): string | undefined => {
    if (!props || typeof props !== 'object') return undefined;

    const candidateKeys = [
      'brgy_name', 'BRGY_NAME', 'barangay', 'Barangay', 'name', 'NAME', 'NAME_2', 'BRGY', 'BRGYNAME', 'BGY_NAME', 'Bgy_Name', 'BgyName'
    ];

    for (const key of candidateKeys) {
      const value = props[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    // Heuristic: find the first string value whose key hints at barangay/name
    for (const key of Object.keys(props)) {
      if (/brgy|barangay|name/i.test(key)) {
        const value = props[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value;
        }
      }
    }

    return undefined;
  }, []);

  // Extract municipality/city name from PSA feature properties
  const getPSAFeatureMunicipalityName = React.useCallback((props: any): string | undefined => {
    if (!props || typeof props !== 'object') return undefined;

    const candidateKeys = [
      'mun_name', 'MUN_NAME', 'municipality', 'Municipality', 'CITY_MUN', 'CITY_MUNICIPALITY',
      'city', 'CITY', 'City', 'CityMun', 'MUNICITY', 'mun', 'Mun_Name', 'MUNI_NAME', 'MUNICITY_NA'
    ];

    for (const key of candidateKeys) {
      const value = props[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    for (const key of Object.keys(props)) {
      if (/city|muni|municipal|citymun|mun_city/i.test(key)) {
        const value = props[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value;
        }
      }
    }

    return undefined;
  }, []);

  // Extract province name from PSA feature properties
  const getPSAFeatureProvinceName = React.useCallback((props: any): string | undefined => {
    if (!props || typeof props !== 'object') return undefined;

    const candidateKeys = [
      'prov_name', 'PROV_NAME', 'province', 'Province', 'PROVINCE', 'PROVINCE_NA', 'prov'
    ];

    for (const key of candidateKeys) {
      const value = props[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    for (const key of Object.keys(props)) {
      if (/prov|province/i.test(key)) {
        const value = props[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value;
        }
      }
    }

    return undefined;
  }, []);

  // Determine if a feature belongs to Iligan City, Lanao del Norte
  const isFeatureInIliganCity = React.useCallback((props: any): boolean => {
    const muniName = getPSAFeatureMunicipalityName(props);
    const provName = getPSAFeatureProvinceName(props);

    const muni = normalizeName(muniName || '');
    const prov = normalizeName(provName || '');

    const isIligan = muni.includes('iligan');
    const isLanaoDelNorte = prov.includes('lanao del norte') || prov.includes('lanao') || prov.includes('ldn');

    // Prefer municipality match; province helps disambiguate if available
    return isIligan || (isIligan && isLanaoDelNorte);
  }, [getPSAFeatureMunicipalityName, getPSAFeatureProvinceName, normalizeName]);

  // Get suitability level for a barangay and crop
  const getBarangaySuitability = React.useCallback((barangay: Barangay, crop: CropType | 'all'): { level: SuitabilityLevel; area: number } => {
    if (crop === 'all') {
      // Determine dominant suitability level by total suitable area across crops
      const areaByLevel: Record<SuitabilityLevel, number> = {
        'highly-suitable': 0,
        'moderately-suitable': 0,
        'low-suitable': 0,
        'not-suitable': 0
      };

      for (const suitability of barangay.suitabilityData) {
        areaByLevel[suitability.suitabilityLevel] += suitability.suitableArea;
      }

      let dominantLevel: SuitabilityLevel = 'not-suitable';
      let dominantArea = 0;
      (Object.keys(areaByLevel) as SuitabilityLevel[]).forEach((level) => {
        if (areaByLevel[level] > dominantArea) {
          dominantLevel = level;
          dominantArea = areaByLevel[level];
        }
      });

      return { level: dominantLevel, area: dominantArea };
    }
    
    const cropSuitability = barangay.suitabilityData.find(s => s.crop === crop);
    return cropSuitability 
      ? { level: cropSuitability.suitabilityLevel, area: cropSuitability.suitableArea }
      : { level: 'not-suitable', area: 0 };
  }, []);


  // Memoized function to find matching barangay
  const findMatchingBarangay = React.useCallback((brgyName: string) => {
    const target = normalizeName(brgyName);
    return barangays.find(b => {
      const local = normalizeName(b.name);
      return local === target || local.includes(target) || target.includes(local);
    });
  }, [barangays, normalizeName]);

  

  // Popup handler for PSA layer
  const getPSALayerPopup = React.useCallback((layer: any) => {
    const feature = layer.feature;
    const psaBrgyName = getPSAFeatureBarangayName(feature.properties) || feature.properties?.brgy_name;
    const matchingBarangay = psaBrgyName ? findMatchingBarangay(psaBrgyName) : undefined;

    if (matchingBarangay) {
      const suitability = getBarangaySuitability(matchingBarangay, selectedCrop);
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
      <strong>${psaBrgyName || 'Unknown Barangay'}</strong><br>
      PSA Code: ${feature.properties.brgy_code || 'N/A'}<br>
      <em>No agricultural data available</em>
    </div>`;
  }, [findMatchingBarangay, getBarangaySuitability, selectedCrop]);

  // Get style for a specific feature and crop (stable function)
  const getFeatureStyle = React.useCallback((feature: any, crop: CropType | 'all') => {
    // Make features outside Iligan City fully transparent
    if (!isFeatureInIliganCity(feature.properties)) {
      return {
        fillColor: '#000000',
        weight: 0,
        opacity: 0,
        color: '#000000',
        fillOpacity: 0
      };
    }

    const psaBrgyName = getPSAFeatureBarangayName(feature.properties) || feature.properties?.brgy_name;
    const matchingBarangay = psaBrgyName ? findMatchingBarangay(psaBrgyName) : undefined;

    // Debug logging for matched zones
    if (psaBrgyName && (normalizeName(psaBrgyName).includes('rogongon') || normalizeName(psaBrgyName).includes('panoroganan'))) {
      console.log('DEBUG Matched Zone:', {
        psaName: psaBrgyName,
        matchFound: !!matchingBarangay,
        barangayName: matchingBarangay?.name,
        matchedArea: matchingBarangay?.matchedArea,
        hasMatchedArea: !!(matchingBarangay?.matchedArea && matchingBarangay.matchedArea > 0)
      });
    }

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
        console.log('PURPLE APPLIED to:', matchingBarangay.name, 'matched area:', matchingBarangay.matchedArea);
      }

      return {
        fillColor: fillColor,
        weight: 2,
        opacity: 1,
        color: strokeColor,
        fillOpacity: fillOpacity
      };
    }

    // Default styling for unmatched barangays within Iligan - slightly visible
    return {
      fillColor: '#94a3b8',
      weight: 1,
      opacity: 0.5,
      color: '#64748b',
      fillOpacity: 0.1
    };
  }, [findMatchingBarangay, getBarangaySuitability, getSuitabilityColor, isFeatureInIliganCity, getPSAFeatureBarangayName]);

  // Click handler for PSA layer (placed after getFeatureStyle to avoid temporal dead zone)
  const handlePSALayerClick = React.useCallback((e: any) => {
    const feature = e.layer.feature;
    // Ignore clicks outside Iligan City
    if (!isFeatureInIliganCity(feature.properties)) {
      return;
    }
    const psaBrgyName = getPSAFeatureBarangayName(feature.properties) || feature.properties?.brgy_name;
    const matchingBarangay = psaBrgyName ? findMatchingBarangay(psaBrgyName) : undefined;

    // Ensure the clicked layer is on top
    if (e.layer && typeof e.layer.bringToFront === 'function') {
      e.layer.bringToFront();
    }

    // Re-apply a safe, visible style to the clicked layer to prevent it from appearing invisible
    if (e.layer && typeof e.layer.setStyle === 'function') {
      const computedStyle = getFeatureStyle(feature, selectedCrop);
      const safeVisibleStyle = {
        ...computedStyle,
        weight: Math.max((computedStyle as any).weight || 0, 2),
        opacity: Math.max((computedStyle as any).opacity || 0, 1),
        fillOpacity: Math.max((computedStyle as any).fillOpacity || 0, 0.4)
      };
      e.layer.setStyle(safeVisibleStyle);
    }

    if (matchingBarangay) {
      onSelectBarangay(matchingBarangay);
    }
  }, [findMatchingBarangay, onSelectBarangay, getFeatureStyle, selectedCrop, getPSAFeatureBarangayName, isFeatureInIliganCity]);

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
        style: (feature: any) => {
          // Ensure non-Iligan features are invisible even at first paint
          if (!isFeatureInIliganCity(feature.properties)) {
            return {
              fillColor: '#000000',
              weight: 0,
              opacity: 0,
              color: '#000000',
              fillOpacity: 0
            };
          }
          // Basic visible style for Iligan features; detailed styling will be applied immediately after
          return {
            fillColor: '#94a3b8',
            weight: 1,
            opacity: 0.5,
            color: '#64748b',
            fillOpacity: 0.2
          };
        }
      });

      // Add event listeners (these won't change unless handlers change)
      psaLayerRef.current.on('click', handlePSALayerClick);
      psaLayerRef.current.bindPopup(getPSALayerPopup);

      psaLayerRef.current.addTo(mapRef.current);
      
      // Apply style immediately so matched zones (purple) render at first paint
      psaLayerRef.current.setStyle((feature: any) => getFeatureStyle(feature, selectedCrop));
      
      // Set loaded state after layer is added
      psaLayerRef.current.on('load', () => {
        setPsaLayerLoaded(true);
        
        // Ensure styles are applied right after features finish loading
        try {
          psaLayerRef.current.setStyle((feature: any) => getFeatureStyle(feature, selectedCrop));
        } catch (e) {
          console.warn('Failed to apply style on load:', e);
        }
        
        // Debug: Log the first few features to see property names
        psaLayerRef.current.eachFeature((layer: any) => {
          if (layer.feature && layer.feature.properties) {
            console.log('PSA Feature properties:', Object.keys(layer.feature.properties), layer.feature.properties);
            return false; // Break after first feature
          }
        });
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

  // Update layer styling when selectedCrop, barangays, or psaLayerLoaded changes
  useEffect(() => {
    if (!psaLayerRef.current || !mapRef.current) return;

    // Update the styling of existing layer immediately, even while loading
    try {
      psaLayerRef.current.setStyle((feature: any) => getFeatureStyle(feature, selectedCrop));
    } catch (e) {
      console.warn('Failed to update style:', e);
    }
  }, [selectedCrop, barangays, getFeatureStyle]);

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