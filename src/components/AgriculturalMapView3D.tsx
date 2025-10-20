import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import type { LayerProps, FillLayer } from 'react-map-gl';
import { Barangay, CropType, SuitabilityLevel } from '@/types/agricultural';

// Disable Mapbox telemetry globally
if (typeof window !== 'undefined') {
  // @ts-ignore - Mapbox GL JS global config
  (window as any).mapboxgl = (window as any).mapboxgl || {};
  // @ts-ignore
  (window as any).mapboxgl.config = {
    ...(window as any).mapboxgl.config,
    TELEMETRY: false,
    PERFORMANCE_METRICS: false
  };
}
import type { HazardLayerConfig } from './AgriculturalHazardLayerControl';
import {
  initializeHazardLayers,
  loadHazardData,
  getFloodLayerStyle,
  getFloodLayerFilter,
  getLandslideLayerStyle,
  getLandslideLayerFilter,
  getSlopeLayerStyle,
  getLanduseLayerStyle,
  getAncestralLayerStyle,
  getSafdzLayerStyle,
  getHazardPopupContent
} from '@/services/agriculturalHazardService';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AgriculturalMapView3DProps {
  barangays: Barangay[];
  selectedCrop: CropType | 'all';
  onSelectBarangay: (barangay: Barangay) => void;
  // SAFDZ filter props
  currentFilters?: {
    sizeCategories: { large: boolean; medium: boolean; small: boolean; micro: boolean };
    minHectares: number;
    maxHectares: number;
    searchBarangay: string;
    selectedBarangays?: string[];
    lmuCategories: { '111': boolean; '112': boolean; '113': boolean; '117': boolean };
    zoningTypes: { [key: string]: boolean };
    landUseTypes: { [key: string]: boolean };
    classTypes: { [key: string]: boolean };
  };
  // SAFDZ data prop (to avoid duplicate loading)
  safdzData?: { features: any[] } | null;
  // Hazard layers props (external control)
  hazardLayers?: HazardLayerConfig[];
  onHazardLayersChange?: (layers: HazardLayerConfig[]) => void;
  globalHazardOpacity?: number;
  // AI results
  aiResults?: any;
  // Map readiness callbacks
  onMapReady?: (isReady: boolean) => void;
  onMap3DReady?: (isReady: boolean) => void;
  // SAFDZ layer control (separate from hazard layers)
  showSafdzLayer?: boolean;
}

// You'll need to get your Mapbox access token from https://mapbox.com
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Validate Mapbox token on load
if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
  console.error('❌ MAPBOX TOKEN MISSING: Please set VITE_MAPBOX_TOKEN in your environment variables');
  console.error('Get your token from: https://account.mapbox.com/access-tokens/');
}

// Global cache for SAFDZ data to prevent re-fetching
let safdzDataCache: any = null;
let safdzDataPromise: Promise<any> | null = null;

export const AgriculturalMapView3D = React.memo(({
  barangays,
  selectedCrop,
  onSelectBarangay,
  currentFilters: externalSafdzFilters,
  safdzData: externalSafdzData,
  hazardLayers: externalHazardLayers,
  onHazardLayersChange,
  globalHazardOpacity: externalGlobalOpacity,
  aiResults,
  onMapReady,
  onMap3DReady,
  showSafdzLayer: externalShowSafdzLayer
}: AgriculturalMapView3DProps) => {
  const mapRef = useRef<MapRef>(null);
  const [boundariesLoaded, setBoundariesLoaded] = useState(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);
  const [safdzData, setSafdzData] = useState<any>(null);
  const [safdzLoading, setSafdzLoading] = useState(true);
  const [safdzError, setSafdzError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [load3DFeatures, setLoad3DFeatures] = useState(false); // Defer 3D loading
  const [safdzLayersReady, setSafdzLayersReady] = useState(false); // Track SAFDZ layer rendering
  const [isMapReady, setIsMapReady] = useState(false); // Track when basic map is loaded
  const [isMap3DReady, setIsMap3DReady] = useState(false); // Track when 3D features are fully loaded

  // Hazard layers state - use external if provided, otherwise internal
  const [internalHazardLayers, setInternalHazardLayers] = useState<HazardLayerConfig[]>([]);
  const hazardLayers = externalHazardLayers !== undefined ? externalHazardLayers : internalHazardLayers;
  const setHazardLayers = onHazardLayersChange || setInternalHazardLayers;
  
  const [hazardDataLoaded, setHazardDataLoaded] = useState<Record<string, any>>({});
  const globalHazardOpacity = externalGlobalOpacity !== undefined ? externalGlobalOpacity : 0.5;
  const [hazardLayersLoading, setHazardLayersLoading] = useState(false);

  // Notify parent component when map readiness changes
  useEffect(() => {
    if (onMapReady) {
      onMapReady(isMapReady);
    }
  }, [isMapReady, onMapReady]);

  // Notify parent component when 3D readiness changes
  useEffect(() => {
    if (onMap3DReady) {
      onMap3DReady(isMap3DReady);
    }
  }, [isMap3DReady, onMap3DReady]);

  // Filter application function for iligan_safdz.geojson properties
  const applySafdzFilters = useCallback((map: any, filters: typeof currentFilters) => {
    if (!map || !filters) return;

    try {
      const filterExpressions: any[] = ['all'];

      // Filter by SAFDZ zones (using lmuCategories mapping)
      // Map filter categories to SAFDZ codes
      const safdzCodes: string[] = [];
      if (filters.lmuCategories['111']) safdzCodes.push('1'); // Strategic CCP
      if (filters.lmuCategories['112']) safdzCodes.push('2'); // Strategic Livestock
      if (filters.lmuCategories['113']) safdzCodes.push('3'); // Strategic Fishery
      if (filters.lmuCategories['117']) safdzCodes.push('8'); // NIPAS

      // Add common zones if any category is enabled
      if (safdzCodes.length > 0) {
        // Also include variations (e.g., "1 / BU", "2 / BU")
        safdzCodes.push('9', '10', 'BU', 'WB', 'Others');
      }

      if (safdzCodes.length > 0) {
        filterExpressions.push(['in', ['get', 'SAFDZ'], ['literal', safdzCodes]]);
      }

      // Filter by municipality/barangay search
      if (filters.searchBarangay) {
        filterExpressions.push([
          'in',
          filters.searchBarangay.toLowerCase(),
          ['downcase', ['get', 'Mun_Name']]
        ]);
      }

      // Filter by selected municipalities
      if (filters.selectedBarangays && filters.selectedBarangays.length > 0) {
        filterExpressions.push([
          'in',
          ['get', 'Mun_Name'],
          ['literal', filters.selectedBarangays]
        ]);
      }

      // Apply filter (if we have any conditions beyond 'all')
      const finalFilter = filterExpressions.length > 1 ? filterExpressions : ['has', 'SAFDZ'];

      if (map.getLayer('safdz-fill')) {
        map.setFilter('safdz-fill', finalFilter);
      }
      if (map.getLayer('safdz-outline')) {
        map.setFilter('safdz-outline', finalFilter);
      }

      console.log('✅ SAFDZ filters applied');
    } catch (error) {
      console.error('❌ Failed to apply SAFDZ filters:', error);
    }
  }, []);


  // Default filters if not provided
  const defaultFilters = {
    sizeCategories: {
      large: true,
      medium: true,
      small: true,
      micro: true
    },
    minHectares: 0,
    maxHectares: 1000,
    selectedBarangays: [] as string[],
    searchBarangay: '',
    lmuCategories: {
      '111': true, // Prime Agricultural Land
      '112': true, // Good Agricultural Land
      '113': true, // Fair Agricultural Land
      '117': true  // Marginal Agricultural Land
    },
    zoningTypes: {
      'Strategic Agriculture': true
    },
    landUseTypes: {
      'Agriculture': true
    },
    classTypes: {
      'rural': true
    }
  };

  const currentFilters = externalSafdzFilters || defaultFilters;

  const [viewState, setViewState] = useState({
    longitude: 124.2452,
    latitude: 8.228,
    zoom: 12,
    pitch: 45, // 3D viewing angle
    bearing: 0
  });

  // Iligan City center coordinates
  const iliganCity = {
    lat: 8.228,
    lng: 124.2452
  };

  // Color mapping for suitability levels
  const getSuitabilityColor = useCallback((level: SuitabilityLevel): string => {
    switch (level) {
      case 'highly-suitable': return '#22c55e';
      case 'moderately-suitable': return '#eab308';
      case 'low-suitable': return '#f97316';
      case 'not-suitable': return '#ef4444';
      default: return '#94a3b8';
    }
  }, []);

  // Normalize barangay names for robust matching
  const normalizeName = useCallback((name?: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\b(brgy\.|brgy|barangay)\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // Extract barangay name from Mapbox Boundaries feature properties
  const getMapboxFeatureBarangayName = useCallback((props: any): string | undefined => {
    if (!props || typeof props !== 'object') return undefined;

    // Mapbox Boundaries v4.5 uses standardized property names
    // For admin level 4 (barangays in Philippines): name, name_en, or similar
    const candidateKeys = [
      'name', 'name_en', 'name_local', 'unit_name', 'admin4_name'
    ];

    for (const key of candidateKeys) {
      const value = props[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return undefined;
  }, []);

  // Find matching barangay
  const findMatchingBarangay = useCallback((brgyName: string) => {
    const target = normalizeName(brgyName);
    return barangays.find(b => {
      const local = normalizeName(b.name);
      return local === target || local.includes(target) || target.includes(local);
    });
  }, [barangays, normalizeName]);

  // Get suitability level for a barangay and crop
  const getBarangaySuitability = useCallback((
    barangay: Barangay,
    crop: CropType | 'all'
  ): { level: SuitabilityLevel; area: number } => {
    if (crop === 'all') {
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

  // SAFDZ data is now loaded on-demand via the separate useEffect when toggle is enabled
  // This useEffect just handles initial state
  useEffect(() => {
    // Don't show loading/error states if toggle is disabled
    if (!externalShowSafdzLayer) {
      setSafdzLoading(false);
      setSafdzError(null);
      return;
    }

    // If external data provided, use it
    if (externalSafdzData) {
      setSafdzData(externalSafdzData);
      setSafdzLoading(false);
      safdzDataCache = externalSafdzData;
      return;
    }

    // If data is cached, use it
    if (safdzDataCache) {
      setSafdzData(safdzDataCache);
      setSafdzLoading(false);
      return;
    }

    // Data will be loaded by the on-demand useEffect below
    setSafdzLoading(false);
    setSafdzError(null);
  }, [externalSafdzData, externalShowSafdzLayer]);

  // Initialize hazard layers (metadata only, no data loading)
  useEffect(() => {
    const loadHazardLayers = async () => {
      try {
        const layers = await initializeHazardLayers();
        setHazardLayers(layers);
      } catch (error) {
        console.error('❌ Failed to initialize hazard layers:', error);
      }
    };

    loadHazardLayers();
  }, []);

  // Load hazard data on-demand when a layer is first enabled
  useEffect(() => {
    const loadEnabledHazardData = async () => {
      for (const layer of hazardLayers) {
        // Only load data for enabled layers that haven't been loaded yet
        if (layer.enabled && !hazardDataLoaded[layer.id]) {
          try {
            console.log(`📥 Loading ${layer.name} data on-demand...`);
            const data = await loadHazardData(layer.id as any);
            
            setHazardDataLoaded(prev => ({
              ...prev,
              [layer.id]: data
            }));

            console.log(`✅ ${layer.name} loaded: ${data.features.length} features`);
          } catch (error) {
            console.error(`❌ Failed to load ${layer.id}:`, error);
          }
        }
      }
    };

    loadEnabledHazardData();
  }, [hazardLayers]);

  // Handle SAFDZ layer separately (controlled by external floating toggle)
  useEffect(() => {
    if (!externalShowSafdzLayer || hazardDataLoaded['safdz']) return;

    const loadSafdzData = async () => {
      try {
        console.log('📥 Loading SAFDZ data on-demand...');
        const data = await loadHazardData('safdz');

        setHazardDataLoaded(prev => ({
          ...prev,
          safdz: data
        }));

        // Update SAFDZ data state
        setSafdzData(data);
      } catch (error) {
        console.error('❌ Failed to load SAFDZ data:', error);
      }
    };

    loadSafdzData();
  }, [externalShowSafdzLayer]);

  // Auto-collapse legend after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLegendExpanded(false);
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, []);

  // Update hazard layers when state changes
  useEffect(() => {
    if (!mapRef.current || !hazardDataLoaded) return;

    const map = mapRef.current.getMap();

    Object.entries(hazardDataLoaded).forEach(([hazardType, data]) => {
      const layer = hazardLayers.find(l => l.id === hazardType);
      const sourceId = `${hazardType}-hazard`;
      const fillLayerId = `${hazardType}-fill`;
      const outlineLayerId = `${hazardType}-outline`;

      // Remove existing layers if they exist
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      // Add layers back if enabled
      if (layer?.enabled && data) {
        // Add source
        map.addSource(sourceId, {
          type: 'geojson',
          data: data
        });

        // Add fill-extrusion layer based on hazard type (pixelated 3D effect)
        let fillColor: any;
        let filter: any = undefined;

        switch (hazardType) {
          case 'flood':
            const floodStyle = getFloodLayerStyle(
              layer.opacity,
              layer.categories?.filter(c => c.enabled).map(c => c.id) || []
            );
            fillColor = floodStyle['fill-color'];
            filter = getFloodLayerFilter(
              layer.categories?.filter(c => c.enabled).map(c => c.id) || []
            );
            break;
          case 'landslide':
            const landslideStyle = getLandslideLayerStyle(layer.opacity);
            fillColor = landslideStyle['fill-color'];
            filter = getLandslideLayerFilter(
              layer.categories?.filter(c => c.enabled).map(c => c.id) || []
            );
            break;
          case 'slope':
            const slopeStyle = getSlopeLayerStyle(layer.opacity);
            fillColor = slopeStyle['fill-color'];
            break;
          case 'landuse':
            const landuseStyle = getLanduseLayerStyle(layer.opacity);
            fillColor = landuseStyle['fill-color'];
            break;
          case 'ancestral':
            const ancestralStyle = getAncestralLayerStyle(layer.opacity);
            fillColor = ancestralStyle['fill-color'];
            break;
        }

        // Add flat fill layer with sharp pixelated edges
        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': fillColor,
            'fill-opacity': layer.opacity,
            'fill-antialias': false // Sharp pixel edges for grid effect
          },
          ...(filter && { filter })
        });

        // Add prominent outline for clear pixelated grid definition
        map.addLayer({
          id: outlineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': [
              'case',
              ['==', hazardType, 'ancestral'], '#8b5cf6',
              '#ffffff' // White outlines for clear grid separation
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 0.5,  // More visible grid lines
              14, 0.8,
              16, 1.2,
              18, 1.5
            ],
            'line-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 0.5,
              14, 0.6,
              16, 0.7  // More visible at higher zoom
            ]
          },
          ...(filter && { filter })
        });
      }
    });
  }, [hazardLayers, hazardDataLoaded]);

  // Apply SAFDZ filters when they change
  useEffect(() => {
    if (!mapRef.current || !safdzData || safdzLoading || safdzError) return;

    const map = mapRef.current.getMap();
    
    // Apply filters after a small delay to ensure layers are ready
    const timer = setTimeout(() => {
      applySafdzFilters(map, currentFilters);
    }, 100);

    return () => clearTimeout(timer);
  }, [currentFilters, safdzData, safdzLoading, safdzError, applySafdzFilters]);

  // Mapbox Boundaries are loaded after map is ready
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current.getMap();
    
    const onMapLoad = () => {
      // Enable boundaries after a short delay to let SAFDZ load first
      setTimeout(() => {
        setBoundariesLoaded(true);
      }, 500);
    };

    if (map.loaded()) {
      onMapLoad();
    } else {
      map.once('load', onMapLoad);
    }
  }, []);

  // Memoize expensive Mapbox expression building
  const fillPaintStyle = useMemo(() => {
    // Build color expression for Mapbox GL based on barangay names
    const colorExpression: any = ['case'];

    barangays.forEach((barangay) => {
      // Check for matched zone first
      if (barangay.matchedArea && barangay.matchedArea > 0) {
        colorExpression.push(
          ['==', ['downcase', ['get', 'name']], normalizeName(barangay.name)],
          '#8b5cf6'
        );
      } else {
        const suitability = getBarangaySuitability(barangay, selectedCrop);
        colorExpression.push(
          ['==', ['downcase', ['get', 'name']], normalizeName(barangay.name)],
          getSuitabilityColor(suitability.level)
        );
      }
    });

    // Default color for unmatched barangays (low opacity gray)
    colorExpression.push('#94a3b8');

    return {
      'fill-color': colorExpression,
      'fill-opacity': [
        'case',
        ['in', ['downcase', ['get', 'name']], ['literal', barangays.map(b => normalizeName(b.name))]],
        0.6,
        0.1 // Unmatched barangays are nearly transparent
      ],
      'fill-outline-color': '#000000'
    };
  }, [barangays, selectedCrop, getBarangaySuitability, getSuitabilityColor, normalizeName]);

  // Handle map click
  const handleMapClick = useCallback((event: any) => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    // Check for SAFDZ layer first (only if layer exists)
    if (map.getLayer('safdz-fill')) {
      const safdzFeatures = mapRef.current.queryRenderedFeatures(event.point, {
        layers: ['safdz-fill']
      });

      if (safdzFeatures && safdzFeatures.length > 0 && externalShowSafdzLayer) {
        const feature = safdzFeatures[0];
        const props = feature.properties;

        // Determine category based on hectares
        const hectares = props?.HECTARES || 0;
        let category = '';
        if (hectares >= 100) category = 'Large (>100 ha)';
        else if (hectares >= 50) category = 'Medium (50-100 ha)';
        else if (hectares >= 20) category = 'Small (20-50 ha)';
        else category = 'Micro (<20 ha)';

        // Determine LMU category meaning
        const lmuCode = props?.LMU_CODE;
        let lmuDescription = '';
        switch (lmuCode) {
          case '111': lmuDescription = 'Prime Agricultural Land'; break;
          case '112': lmuDescription = 'Good Agricultural Land'; break;
          case '113': lmuDescription = 'Fair Agricultural Land'; break;
          case '117': lmuDescription = 'Marginal Agricultural Land'; break;
          default: lmuDescription = 'Unknown'; break;
        }

        // You can add a popup or notification here to show SAFDZ details
        return;
      }
    }

    // Fall back to barangay click (only if layer exists)
    if (map.getLayer('barangay-boundaries-fill')) {
      const features = mapRef.current.queryRenderedFeatures(event.point, {
        layers: ['barangay-boundaries-fill']
      });

      if (features && features.length > 0) {
        const feature = features[0];
        const brgyName = getMapboxFeatureBarangayName(feature.properties);
        const matchingBarangay = brgyName ? findMatchingBarangay(brgyName) : undefined;

        if (matchingBarangay) {
          onSelectBarangay(matchingBarangay);
        }
      }
    }
  }, [findMatchingBarangay, onSelectBarangay, getMapboxFeatureBarangayName, externalShowSafdzLayer]);

  // Add SAFDZ layers to map (when data is loaded or map style changes)
  useEffect(() => {
    const map = mapRef.current?.getMap();
    // Don't wait for boundaries - SAFDZ can load independently
    if (!map || !safdzData || safdzLoading || safdzError) return;
    
    console.log('🎯 SAFDZ useEffect triggered - attempting to add layers');

    const addSafdzLayers = () => {
      // Ensure map style is loaded before adding layers; if not, wait once
      if (!map.isStyleLoaded()) {
        const onStyleReady = () => {
          // Remove listener to avoid duplicate calls
          map.off('styledata', onStyleReady);
          addSafdzLayers();
        };
        map.on('styledata', onStyleReady);
        return;
      }

      try {
        // Always remove existing layers first to ensure clean state
        if (map.getLayer('safdz-labels')) map.removeLayer('safdz-labels');
        if (map.getLayer('safdz-outline')) map.removeLayer('safdz-outline');
        if (map.getLayer('safdz-fill')) map.removeLayer('safdz-fill');
        if (map.getLayer('safdz-fill-test')) map.removeLayer('safdz-fill-test');
        if (map.getSource('safdz-zones')) map.removeSource('safdz-zones');

        // Add GeoJSON source
        console.log('🗺️ Adding SAFDZ source with', safdzData.features.length, 'features');
        console.log('🗺️ Map style loaded:', map.isStyleLoaded());
        console.log('🗺️ Existing layers:', map.getStyle()?.layers?.map(l => l.id));

        map.addSource('safdz-zones', {
          type: 'geojson',
          data: safdzData
        });

        console.log('✅ SAFDZ source added successfully');

        // Find first symbol layer to insert SAFDZ layers before it
        const firstSymbolLayer = map.getStyle().layers?.find(layer => layer.type === 'symbol');
        const beforeLayerId = firstSymbolLayer?.id;
        console.log('🎯 Inserting SAFDZ layers before:', beforeLayerId || 'top');

        // Add fill layer with hectare-based categorization and filtering
        // Add it before 3D buildings to ensure proper layering
        map.addLayer({
          id: 'safdz-fill',
          type: 'fill',
          source: 'safdz-zones',
          // Temporarily remove complex filters to test basic visibility
          // filter: ['all',
          //   // Size category filter
          //   ['any',
          //     ['all', ['>=', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.large], true]],
          //     ['all', ['>=', ['get', 'HECTARES'], 50], ['<', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.medium], true]],
          //     ['all', ['>=', ['get', 'HECTARES'], 20], ['<', ['get', 'HECTARES'], 50], ['==', ['literal', currentFilters.sizeCategories.small], true]],
          //     ['all', ['<', ['get', 'HECTARES'], 20], ['==', ['literal', currentFilters.sizeCategories.micro], true]]
          //   ],
          //   // Hectare range filter
          //   ['>=', ['get', 'HECTARES'], currentFilters.minHectares],
          //   ['<=', ['get', 'HECTARES'], currentFilters.maxHectares],
          //   // LMU category filter
          //   ['any',
          //     ['all', ['==', ['get', 'LMU_CODE'], '111'], ['==', ['literal', currentFilters.lmuCategories['111']], true]],
          //     ['all', ['==', ['get', 'LMU_CODE'], '112'], ['==', ['literal', currentFilters.lmuCategories['112']], true]],
          //     ['all', ['==', ['get', 'LMU_CODE'], '113'], ['==', ['literal', currentFilters.lmuCategories['113']], true]],
          //     ['all', ['==', ['get', 'LMU_CODE'], '117'], ['==', ['literal', currentFilters.lmuCategories['117']], true]]
          //   ],
          //   // Zoning filter
          //   ['any',
          //     ['all', ['==', ['get', 'ZONING'], 'Strategic Agriculture'], ['==', ['literal', currentFilters.zoningTypes['Strategic Agriculture']], true]]
          //   ],
          //   // Land use filter
          //   ['any',
          //     ['all', ['==', ['get', 'LANDUSE'], 'Agriculture'], ['==', ['literal', currentFilters.landUseTypes['Agriculture']], true]]
          //   ],
          //   // Class filter
          //   ['any',
          //     ['all', ['==', ['get', 'CLASS'], 'rural'], ['==', ['literal', currentFilters.classTypes['rural']], true]]
          //   ],
          //   // Barangay filter (if any selected)
          //   currentFilters.selectedBarangays && currentFilters.selectedBarangays.length > 0
          //     ? ['in', ['get', 'BRGY'], ['literal', currentFilters.selectedBarangays]]
          //     : ['literal', true],
          //   // Search filter
          //   currentFilters.searchBarangay
          //     ? ['in', currentFilters.searchBarangay.toLowerCase(), ['downcase', ['get', 'BRGY']]]
          //     : ['literal', true]
          // ],
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'SAFDZ'], '1'], '#7CFC00',       // Strategic CCP Sub-development Zone - Lawn Green (bright)
              ['==', ['get', 'SAFDZ'], '2'], '#8B4789',       // Strategic Livestock Sub-development Zone - Purple (rich)
              ['==', ['get', 'SAFDZ'], '3'], '#87CEEB',       // Strategic Fishery Sub-development Zone - Sky Blue
              ['==', ['get', 'SAFDZ'], '4'], '#9ACD32',       // Strategic Integrated Crop/Livestock - Yellow Green
              ['==', ['get', 'SAFDZ'], '5'], '#48D1CC',       // Strategic Integrated Crop/Fishery - Medium Turquoise
              ['==', ['get', 'SAFDZ'], '6'], '#20B2AA',       // Strategic Integrated Crop/Livestock/Fishery - Light Sea Green
              ['==', ['get', 'SAFDZ'], '7'], '#4169E1',       // Strategic Integrated Fishery and Livestock - Royal Blue
              ['==', ['get', 'SAFDZ'], '8'], '#DA70D6',       // NIPAS - Orchid (pink/violet)
              ['==', ['get', 'SAFDZ'], '9'], '#FF8C00',       // Rangelands/PAAD - Dark Orange (vibrant)
              ['==', ['get', 'SAFDZ'], '10'], '#228B22',      // Sub-watershed/Forestry Zone - Forest Green
              ['==', ['get', 'SAFDZ'], 'BU'], '#A9A9A9',      // Built-Up Areas - Dark Gray
              ['==', ['get', 'SAFDZ'], 'WB'], '#1E90FF',      // Water Bodies - Dodger Blue
              // Handle mixed classifications (e.g., "9 / BU") - use primary code
              ['in', '1', ['get', 'SAFDZ']], '#7CFC00',
              ['in', '2', ['get', 'SAFDZ']], '#8B4789',
              ['in', '3', ['get', 'SAFDZ']], '#87CEEB',
              ['in', '8', ['get', 'SAFDZ']], '#DA70D6',
              ['in', '9', ['get', 'SAFDZ']], '#FF8C00',
              '#DCDCDC'                                        // Default - Others - Gainsboro
            ],
            'fill-opacity': 0.7, // Increased opacity for better visibility during debugging
            'fill-antialias': true // Smooth edges for better visuals
          },
          layout: {
            'visibility': 'visible'
          }
        }, beforeLayerId); // Add before symbol layers so labels appear on top

        console.log('✅ SAFDZ fill layer added to map');
        console.log('🗺️ SAFDZ fill layer exists:', map.getLayer('safdz-fill') ? 'YES' : 'NO');
        console.log('🗺️ SAFDZ source exists:', map.getSource('safdz-zones') ? 'YES' : 'NO');
        
        // Force visibility and check if features are being rendered
        if (map.getLayer('safdz-fill')) {
          map.setLayoutProperty('safdz-fill', 'visibility', 'visible');
          const renderedFeatures = map.querySourceFeatures('safdz-zones');
          console.log('🎨 Rendered SAFDZ features:', renderedFeatures.length);
        }

        // PROGRESSIVE LOADING: Apply complex filters after initial render
        // This prevents the heavy filter computation from blocking the initial display
        // TEMPORARILY DISABLED to debug visualization issues
        // setTimeout(() => {
        //   console.log('🔄 Applying SAFDZ filters progressively...');
        //   applySafdzFilters(map, currentFilters);
        // }, 200); // Allow initial render to complete first

        // Make map available globally for debugging
        (window as any).map = map;

        // Add outline layer with matching categorization colors and filtering
        map.addLayer({
          id: 'safdz-outline',
          type: 'line',
          source: 'safdz-zones',
          // Temporarily remove complex filters to test basic visibility
          // filter: ['all',
          //   // Size category filter
          //   ['any',
          //     ['all', ['>=', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.large], true]],
          //     ['all', ['>=', ['get', 'HECTARES'], 50], ['<', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.medium], true]],
          //     ['all', ['>=', ['get', 'HECTARES'], 20], ['<', ['get', 'HECTARES'], 50], ['==', ['literal', currentFilters.sizeCategories.small], true]],
          //     ['all', ['<', ['get', 'HECTARES'], 20], ['==', ['literal', currentFilters.sizeCategories.micro], true]]
          //   ],
          //   // Hectare range filter
          //   ['>=', ['get', 'HECTARES'], currentFilters.minHectares],
          //   ['<=', ['get', 'HECTARES'], currentFilters.maxHectares],
          //   // LMU category filter
          //   ['any',
          //     ['all', ['==', ['get', 'LMU_CODE'], '111'], ['==', ['literal', currentFilters.lmuCategories['111']], true]],
          //     ['all', ['==', ['get', 'LMU_CODE'], '112'], ['==', ['literal', currentFilters.lmuCategories['112']], true]],
          //     ['all', ['==', ['get', 'LMU_CODE'], '113'], ['==', ['literal', currentFilters.lmuCategories['113']], true]],
          //     ['all', ['==', ['get', 'LMU_CODE'], '117'], ['==', ['literal', currentFilters.lmuCategories['117']], true]]
          //   ],
          //   // Zoning filter
          //   ['any',
          //     ['all', ['==', ['get', 'ZONING'], 'Strategic Agriculture'], ['==', ['literal', currentFilters.zoningTypes['Strategic Agriculture']], true]]
          //   ],
          //   // Land use filter
          //   ['any',
          //     ['all', ['==', ['get', 'LANDUSE'], 'Agriculture'], ['==', ['literal', currentFilters.landUseTypes['Agriculture']], true]]
          //   ],
          //   // Class filter
          //   ['any',
          //     ['all', ['==', ['get', 'CLASS'], 'rural'], ['==', ['literal', currentFilters.classTypes['rural']], true]]
          //   ],
          //   // Barangay filter (if any selected)
          //   currentFilters.selectedBarangays && currentFilters.selectedBarangays.length > 0
          //     ? ['in', ['get', 'BRGY'], ['literal', currentFilters.selectedBarangays]]
          //     : ['literal', true],
          //   // Search filter
          //   currentFilters.searchBarangay
          //     ? ['in', currentFilters.searchBarangay.toLowerCase(), ['downcase', ['get', 'BRGY']]]
          //     : ['literal', true]
          // ],
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'SAFDZ'], '1'], '#228B22',       // Strategic CCP - Forest Green
              ['==', ['get', 'SAFDZ'], '2'], '#4B0082',       // Strategic Livestock - Indigo
              ['==', ['get', 'SAFDZ'], '3'], '#4682B4',       // Strategic Fishery - Steel Blue
              ['==', ['get', 'SAFDZ'], '4'], '#6B8E23',       // Strategic Integrated Crop/Livestock - Olive Drab
              ['==', ['get', 'SAFDZ'], '5'], '#008B8B',       // Strategic Integrated Crop/Fishery - Dark Cyan
              ['==', ['get', 'SAFDZ'], '6'], '#2F4F4F',       // Strategic Integrated Crop/Livestock/Fishery - Dark Slate Gray
              ['==', ['get', 'SAFDZ'], '7'], '#191970',       // Strategic Integrated Fishery and Livestock - Midnight Blue
              ['==', ['get', 'SAFDZ'], '8'], '#8B008B',       // NIPAS - Dark Magenta
              ['==', ['get', 'SAFDZ'], '9'], '#D2691E',       // Rangelands/PAAD - Chocolate
              ['==', ['get', 'SAFDZ'], '10'], '#006400',      // Sub-watershed/Forestry - Dark Green
              ['==', ['get', 'SAFDZ'], 'BU'], '#2F4F4F',      // Built-Up Areas - Dark Slate Gray
              ['==', ['get', 'SAFDZ'], 'WB'], '#00008B',      // Water Bodies - Dark Blue
              // Handle mixed classifications
              ['in', '1', ['get', 'SAFDZ']], '#228B22',
              ['in', '2', ['get', 'SAFDZ']], '#4B0082',
              ['in', '3', ['get', 'SAFDZ']], '#4682B4',
              ['in', '8', ['get', 'SAFDZ']], '#8B008B',
              ['in', '9', ['get', 'SAFDZ']], '#D2691E',
              '#696969'                                        // Default - Dim Gray
            ],
            'line-width': 2.0, // Increased width for better visibility during debugging
            'line-opacity': 0.9 // Increased opacity for clear boundaries
          },
          layout: {
            'visibility': 'visible'
          }
        }, beforeLayerId); // Add before symbol layers

        console.log('✅ SAFDZ outline layer added to map');
        
        // Force visibility for outline layer
        if (map.getLayer('safdz-outline')) {
          map.setLayoutProperty('safdz-outline', 'visibility', 'visible');
        }

        // Mark SAFDZ layers as ready (3D features are now loaded via handleMapLoad)
        setSafdzLayersReady(true);
        
        // Log current viewport to help debug if features are in view
        const bounds = map.getBounds();
        console.log('🗺️ Map bounds:', {
          north: bounds.getNorth().toFixed(4),
          south: bounds.getSouth().toFixed(4),
          east: bounds.getEast().toFixed(4),
          west: bounds.getWest().toFixed(4)
        });

        // Labels layer disabled - not showing barangay names and hectare sizes yet
        // Uncomment when labels are needed
        /*
        map.addLayer({
          id: 'safdz-labels',
          type: 'symbol',
          source: 'safdz-zones',
          minzoom: 11,
          filter: ['all',
            // Size category filter
            ['any',
              ['all', ['>=', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.large], true]],
              ['all', ['>=', ['get', 'HECTARES'], 50], ['<', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.medium], true]],
              ['all', ['>=', ['get', 'HECTARES'], 20], ['<', ['get', 'HECTARES'], 50], ['==', ['literal', currentFilters.sizeCategories.small], true]],
              ['all', ['<', ['get', 'HECTARES'], 20], ['==', ['literal', currentFilters.sizeCategories.micro], true]]
            ],
            // Hectare range filter
            ['>=', ['get', 'HECTARES'], currentFilters.minHectares],
            ['<=', ['get', 'HECTARES'], currentFilters.maxHectares],
            // LMU category filter
            ['any',
              ['all', ['==', ['get', 'LMU_CODE'], '111'], ['==', ['literal', currentFilters.lmuCategories['111']], true]],
              ['all', ['==', ['get', 'LMU_CODE'], '112'], ['==', ['literal', currentFilters.lmuCategories['112']], true]],
              ['all', ['==', ['get', 'LMU_CODE'], '113'], ['==', ['literal', currentFilters.lmuCategories['113']], true]],
              ['all', ['==', ['get', 'LMU_CODE'], '117'], ['==', ['literal', currentFilters.lmuCategories['117']], true]]
            ],
            // Zoning filter
            ['any',
              ['all', ['==', ['get', 'ZONING'], 'Strategic Agriculture'], ['==', ['literal', currentFilters.zoningTypes['Strategic Agriculture']], true]]
            ],
            // Land use filter
            ['any',
              ['all', ['==', ['get', 'LANDUSE'], 'Agriculture'], ['==', ['literal', currentFilters.landUseTypes['Agriculture']], true]]
            ],
            // Class filter
            ['any',
              ['all', ['==', ['get', 'CLASS'], 'rural'], ['==', ['literal', currentFilters.classTypes['rural']], true]]
            ],
            // Barangay filter (if any selected)
            currentFilters.selectedBarangays && currentFilters.selectedBarangays.length > 0
              ? ['in', ['get', 'BRGY'], ['literal', currentFilters.selectedBarangays]]
              : ['literal', true],
            // Search filter
            currentFilters.searchBarangay
              ? ['in', currentFilters.searchBarangay.toLowerCase(), ['downcase', ['get', 'BRGY']]]
              : ['literal', true]
          ],
          layout: {
            'text-field': ['concat', ['get', 'BRGY'], '\n', ['to-string', ['get', 'HECTARES']], ' ha'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-max-width': 8
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#1e3a8a',
            'text-halo-width': 2,
            'text-opacity': 0.9
          }
        });
        */
      } catch (error) {
        console.error('❌ Failed to add SAFDZ layers:', error);
        console.error('❌ Error details:', error instanceof Error ? error.message : error);
        console.error('❌ Map has style:', map.getStyle() !== undefined);
        console.error('❌ Style loaded:', map.isStyleLoaded());
      }
    };

    // Wait for both map and style to be fully loaded before adding layers
    const waitForMapReady = () => {
      // First wait for map to be loaded
      if (!map.loaded()) {
        console.log('⏳ Waiting for map to load...');
        map.once('load', () => {
          waitForStyleReady();
        });
        return;
      }

      waitForStyleReady();
    };

    const waitForStyleReady = () => {
      // Then wait for style to be loaded
      if (!map.isStyleLoaded()) {
        console.log('⏳ Waiting for map style to load...');
        map.once('style.load', () => {
          console.log('✅ Map and style are both ready - adding SAFDZ layers');
          addSafdzLayers();
        });
        return;
      }

      // Both map and style are ready
      console.log('✅ Map and style are both ready - adding SAFDZ layers');
      addSafdzLayers();
    };

    // Start the waiting process
    waitForMapReady();

    return () => {
      // Cleanup layers when component unmounts
      if (map && map.getStyle()) {
        try {
          if (map.getLayer('safdz-outline')) map.removeLayer('safdz-outline');
          if (map.getLayer('safdz-fill')) map.removeLayer('safdz-fill');
          if (map.getSource('safdz-zones')) map.removeSource('safdz-zones');
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [safdzData, mapStyle]); // Re-add layers when data or map style changes (removed boundariesLoaded dependency)


  // Handle AI results - highlight matching SAFDZ zones in blue
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !safdzData || !aiResults) return;

    try {
      // Remove existing AI highlight layer
      if (map.getLayer('ai-highlight-fill')) map.removeLayer('ai-highlight-fill');
      if (map.getLayer('ai-highlight-outline')) map.removeLayer('ai-highlight-outline');
      if (map.getSource('ai-highlight')) map.removeSource('ai-highlight');

      // Extract barangay names from AI results
      const aiBarangayNames = aiResults.topLocations.map((loc: any) =>
        loc.name.replace(/^Barangay\s+/i, '').toLowerCase().trim()
      );

      // Filter SAFDZ features that match AI result barangays
      // Also apply additional filtering based on soil quality if available
      const matchingFeatures = safdzData.features.filter((feature: any) => {
        const featureBarangayName = (feature.properties.BRGY || '').toLowerCase().trim();
        const barangayMatch = aiBarangayNames.some((aiName: string) =>
          featureBarangayName.includes(aiName) || aiName.includes(featureBarangayName)
        );

        if (!barangayMatch) return false;

        // Additional filtering based on AI criteria
        // Look for Prime (111) and Good (112) agricultural land if mentioned in criteria
        const lmuCode = feature.properties.LMU_CODE;
        const isPrimeOrGood = lmuCode === '111' || lmuCode === '112';

        // For better site selection, prioritize prime/good land if available
        return isPrimeOrGood || barangayMatch;
      });

      // Sort by soil quality (prioritize prime land) and take top zones
      const sortedFeatures = matchingFeatures.sort((a, b) => {
        const lmuOrder: Record<string, number> = { '111': 1, '112': 2, '113': 3, '117': 4 };
        const aOrder = lmuOrder[a.properties.LMU_CODE] || 99;
        const bOrder = lmuOrder[b.properties.LMU_CODE] || 99;
        return aOrder - bOrder;
      });

      // Take top zones (limit to prevent overwhelming the map)
      const topFeatures = sortedFeatures.slice(0, 20);

      if (topFeatures.length > 0) {
        console.log('🎯 AI highlighting', topFeatures.length, 'zones:',
          topFeatures.map((f: any) => ({
            brgy: f.properties.BRGY,
            lmu: f.properties.LMU_CODE,
            hectares: f.properties.HECTARES
          }))
        );

        // Add source for highlighted zones
        map.addSource('ai-highlight', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: topFeatures
          }
        });

        // Add bright blue fill layer for highlighting
        map.addLayer({
          id: 'ai-highlight-fill',
          type: 'fill',
          source: 'ai-highlight',
          paint: {
            'fill-color': '#3b82f6', // Bright blue
            'fill-opacity': 0.5 // Increased opacity for better visibility
          }
        });

        // Add prominent blue outline
        map.addLayer({
          id: 'ai-highlight-outline',
          type: 'line',
          source: 'ai-highlight',
          paint: {
            'line-color': '#1e40af', // Dark blue outline
            'line-width': 4, // Thicker outline for better visibility
            'line-opacity': 1.0 // Full opacity for clear boundaries
          }
        });

        // Calculate the center point from the actual matched zones
        // Use the centroid of the first feature's geometry
        const firstFeature = topFeatures[0];
        let centerLng = 0;
        let centerLat = 0;
        let pointCount = 0;

        // Calculate centroid from geometry coordinates
        if (firstFeature.geometry.type === 'Polygon') {
          const coords = firstFeature.geometry.coordinates[0];
          coords.forEach((coord: number[]) => {
            centerLng += coord[0];
            centerLat += coord[1];
            pointCount++;
          });
        } else if (firstFeature.geometry.type === 'MultiPolygon') {
          firstFeature.geometry.coordinates.forEach((polygon: number[][][]) => {
            polygon[0].forEach((coord: number[]) => {
              centerLng += coord[0];
              centerLat += coord[1];
              pointCount++;
            });
          });
        }

        if (pointCount > 0) {
          centerLng /= pointCount;
          centerLat /= pointCount;

          console.log('🗺️ Flying to calculated center:', { lng: centerLng, lat: centerLat });

          // Fly to the calculated center of the highlighted zones
          map.flyTo({
            center: [centerLng, centerLat],
            zoom: 15, // Zoom in closer to see the highlighted zones
            pitch: 45, // Maintain 3D view
            duration: 2000
          });
        }
      }
    } catch (error) {
      console.error('Error highlighting AI results:', error);
    }

    // Cleanup when AI results change or are cleared
    return () => {
      const map = mapRef.current?.getMap();
      if (map && map.getStyle()) {
        try {
          if (map.getLayer('ai-highlight-fill')) map.removeLayer('ai-highlight-fill');
          if (map.getLayer('ai-highlight-outline')) map.removeLayer('ai-highlight-outline');
          if (map.getSource('ai-highlight')) map.removeSource('ai-highlight');
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [aiResults, safdzData]);

  // Handle minimal map load setup (defer heavy 3D operations)
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Mark basic map as ready (loading screen can hide now)
    setIsMapReady(true);
    console.log('✅ Basic map loaded and ready');

    // Hide most labels but keep barangay names visible
    const hideLabels = () => {
      const layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.id) {
            // Hide all labels except we'll add our own barangay labels
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });
      }
    };

    // Hide labels immediately and also on style load
    hideLabels();
    map.on('style.load', hideLabels);

    // CRITICAL: Defer 3D features to AFTER SAFDZ layers are ready
    // This prevents blocking SAFDZ loading
    setTimeout(() => {
      console.log('🕒 Starting deferred 3D feature loading...');
      setLoad3DFeatures(true);
    }, 100); // Small delay to ensure SAFDZ has started loading
  }, []);

  // 3D features are now enabled via handleMapLoad after SAFDZ layers

  // Add 3D features after SAFDZ layers are rendered (deferred loading)
  useEffect(() => {
    if (!load3DFeatures) return;

    const map = mapRef.current?.getMap();
    const add3DFeatures = () => {
      if (!map.isStyleLoaded()) return;
      try {
        // Add terrain source for 3D elevation
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });
        }

        // Set the terrain with proper exaggeration for visibility
        map.setTerrain({
          source: 'mapbox-dem',
          exaggeration: [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 2.0,
            14, 1.8,
            18, 1.2
          ]
        });

        // Add 3D buildings layer with better visibility settings
        if (!map.getLayer('3d-buildings')) {
          map.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#e0e0e0',
                50, '#c0c0c0',
                100, '#a0a0a0',
                200, '#808080'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                13.5, ['*', ['get', 'height'], 0.5],
                16, ['*', ['get', 'height'], 1.0]
              ],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.8,
              'fill-extrusion-vertical-gradient': true
            }
          });
        }

        // Enhanced fog for better atmosphere
        map.setFog({
          color: 'rgb(240, 248, 255)',
          'high-color': 'rgb(180, 200, 230)',
          'horizon-blend': 0.2,
          'space-color': 'rgb(70, 80, 100)',
          'star-intensity': 0.0,
          range: [2, 12]
        });

        // Enhanced lighting for better building definition
        map.setLight({
          anchor: 'viewport',
          color: 'white',
          intensity: 0.5,
          position: [1, 90, 45]
        });

        // Mark 3D features as ready
        setIsMap3DReady(true);
        console.log('✅ 3D features fully loaded');
      } catch (error) {
        console.error('❌ Failed to add 3D features:', error);
        // Even on error, we should not block the loading screen indefinitely
        setIsMap3DReady(true);
      }
    };

    // Add immediately and also whenever the style reloads (e.g. style switch)
    add3DFeatures();
    map.on('style.load', add3DFeatures);

    return () => {
      map.off('style.load', add3DFeatures as any);
    };
  }, [load3DFeatures]);

  // Fill layer configuration for Mapbox Boundaries v4.5
  const fillLayer: FillLayer = {
    id: 'barangay-boundaries-fill',
    type: 'fill',
    'source-layer': 'boundaries_admin_4',
    filter: ['==', ['get', 'iso_3166_1'], 'PH'], // Filter for Philippines only
    paint: fillPaintStyle as any
  };

  // Line layer for boundaries
  const lineLayer: LayerProps = {
    id: 'barangay-boundaries-line',
    type: 'line',
    'source-layer': 'boundaries_admin_4',
    filter: ['==', ['get', 'iso_3166_1'], 'PH'], // Filter for Philippines only
    paint: {
      'line-color': '#000000',
      'line-width': 2,
      'line-opacity': 0.8
    }
  };

  // Symbol layer for barangay names
  const barangayLabelsLayer: LayerProps = {
    id: 'barangay-labels',
    type: 'symbol',
    'source-layer': 'boundaries_admin_4',
    filter: ['==', ['get', 'iso_3166_1'], 'PH'], // Filter for Philippines only
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-anchor': 'center',
      'text-justify': 'center',
      'text-font': ['Open Sans Regular'],
      'text-max-width': 8,
      'text-letter-spacing': 0.1,
      'text-transform': 'none'
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 1.5,
      'text-opacity': 0.9
    },
    minzoom: 12
  };

  return (
    <div className="fixed inset-0 z-0">
      <style>{`
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib,
        .mapboxgl-ctrl-attrib-inner,
        .mapboxgl-ctrl-attrib a,
        .mapbox-improve-map,
        .mapboxgl-compact {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>
      <div className="relative w-full h-full bg-muted/30">

        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          transformRequest={(url) => {
            // Block Mapbox telemetry/analytics requests
            if (url.includes('events.mapbox.com')) {
              return { cancel: true, url };
            }
            return { url };
          }}
        >
          {/* Mapbox Boundaries - Load only when map is ready */}
          {boundariesLoaded && (
            <Source
              id="mapbox-boundaries"
              type="vector"
              url="mapbox://mapbox.enterprise-boundaries-a4-v4"
            >
              <Layer {...fillLayer} />
              <Layer {...lineLayer} />
              <Layer {...barangayLabelsLayer} />
            </Source>
          )}

          {/* SAFDZ layers are added imperatively via useEffect - see addSafdzLayers function */}
          {/* Hazard layers are added imperatively via useEffect - see hazard layer update effect */}
        </Map>

        {/* Map Legend - Compact by default, expands on hover */}
        <div
          className="absolute bottom-4 right-4 bg-white/90 rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out cursor-pointer"
          onMouseEnter={() => setIsLegendExpanded(true)}
          onMouseLeave={() => setIsLegendExpanded(false)}
        >
          {!isLegendExpanded ? (
            /* Compact View - Just color dots */
            <div className="p-3 flex items-center gap-2 flex-wrap max-w-[200px]">

              {/* Hazard Colors - only show if hazards are enabled */}
              {hazardLayers.find(l => l.id === 'flood' && l.enabled) && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#60a5fa' }} title="Flood Risk"></div>
              )}
              {hazardLayers.find(l => l.id === 'landslide' && l.enabled) && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ea580c' }} title="Landslide Risk"></div>
              )}
              {hazardLayers.find(l => l.id === 'slope' && l.enabled) && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#d4a373' }} title="Slope Analysis"></div>
              )}
              {hazardLayers.find(l => l.id === 'landuse' && l.enabled) && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16a34a' }} title="Land Use"></div>
              )}
              {hazardLayers.find(l => l.id === 'ancestral' && l.enabled) && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b5cf6' }} title="Ancestral Domain"></div>
              )}
              {externalShowSafdzLayer && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7CFC00' }} title="SAFDZ Zones"></div>
              )}
            </div>
          ) : (
            /* Expanded View - Full details */
            <div className="p-4">
              {/* Hazard Layers Legend */}
              {hazardLayers.some(layer => layer.enabled) && (
                <div>
                  <div className="text-xs font-semibold text-foreground mb-3">Active Hazard Layers</div>
                  <div className="space-y-3">
                    {/* Flood Hazard Legend */}
                    {hazardLayers.find(l => l.id === 'flood' && l.enabled) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-blue-700">🌊 Flood Risk</div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#60a5fa' }}></div>
                            <span className="text-xs">Low</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                            <span className="text-xs">Medium</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#2563eb' }}></div>
                            <span className="text-xs">High</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#1e3a8a' }}></div>
                            <span className="text-xs">Very High</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Landslide Hazard Legend */}
                    {hazardLayers.find(l => l.id === 'landslide' && l.enabled) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-orange-700">🏔️ Landslide Risk</div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#ea580c' }}></div>
                            <span className="text-xs">Low</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#c2410c' }}></div>
                            <span className="text-xs">Medium</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#92400e' }}></div>
                            <span className="text-xs">High</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#7c2d12' }}></div>
                            <span className="text-xs">Very High</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Slope Analysis Legend */}
                    {hazardLayers.find(l => l.id === 'slope' && l.enabled) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-yellow-700">📐 Slope Analysis</div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#d6d3d1' }}></div>
                            <span className="text-xs">Flat (0-3°)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#d4a373' }}></div>
                            <span className="text-xs">Gentle (3-8°)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#eab308' }}></div>
                            <span className="text-xs">Moderate (8-18°)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#f97316' }}></div>
                            <span className="text-xs">Steep (18-30°)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                            <span className="text-xs">Very Steep (31-50°)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#991b1b' }}></div>
                            <span className="text-xs">Extreme (&gt;50°)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Land Use Legend */}
                    {hazardLayers.find(l => l.id === 'landuse' && l.enabled) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-green-700">🏗️ Land Use</div>
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                            <span className="text-xs">Growth Areas</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#16a34a' }}></div>
                            <span className="text-xs">Forestland</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#84cc16' }}></div>
                            <span className="text-xs">Agriculture</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                            <span className="text-xs">Urban</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ancestral Domain Legend */}
              {hazardLayers.find(l => l.id === 'ancestral' && l.enabled) && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-purple-700">🏞️ Ancestral Domain</div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                    <span className="text-xs">Protected Areas</span>
                  </div>
                </div>
              )}

                  </div>
                </div>
              )}

              {/* SAFDZ Legend */}
              {externalShowSafdzLayer && (
                <div>
                  <div className="text-xs font-semibold text-foreground mb-3">🌱 SAFDZ Zones</div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-green-700">Strategic Agriculture & Fisheries Development</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: '#7CFC00' }}></div>
                        <span className="text-xs">CCP Zone</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: '#8B4789' }}></div>
                        <span className="text-xs">Livestock</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: '#87CEEB' }}></div>
                        <span className="text-xs">Fishery</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: '#DA70D6' }}></div>
                        <span className="text-xs">NIPAS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* 3D Controls Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Right-click + drag to rotate</div>
                  <div>• Ctrl + drag to change pitch</div>
                  <div>• Scroll to zoom</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View controls */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2.5 z-[400] min-w-[160px]">
          {/* View Mode Controls */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setViewState(prev => ({ ...prev, pitch: prev.pitch > 0 ? 0 : 45 }))}
              className="px-3 py-2 bg-white/80 rounded-md shadow-sm border border-gray-300/50 hover:bg-white/90 transition-all duration-200 text-gray-700 font-medium text-sm"
            >
              {viewState.pitch > 0 ? '2D View' : '3D View'}
            </button>
            <button
              onClick={() => setViewState(prev => ({ ...prev, bearing: 0, pitch: 45 }))}
              className="px-3 py-2 bg-white/80 rounded-md shadow-sm border border-gray-300/50 hover:bg-white/90 transition-all duration-200 text-gray-700 font-medium text-sm"
            >
              Reset View
            </button>
            <button
              onClick={() => {
                const map = mapRef.current?.getMap();
                if (!map) return;

                // Preserve current view state
                const currentViewState = viewState;

                // Change map style
                const newStyle = mapStyle === 'mapbox://styles/mapbox/streets-v12'
                  ? 'mapbox://styles/mapbox/satellite-v9'
                  : 'mapbox://styles/mapbox/streets-v12';

                setMapStyle(newStyle);

                // Restore view state, terrain, and re-add SAFDZ layers after style loads
                const restoreView = () => {
                  try {
                    // Check if terrain source exists, add it if not
                    if (!map.getSource('mapbox-dem')) {
                      map.addSource('mapbox-dem', {
                        type: 'raster-dem',
                        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        tileSize: 512,
                        maxzoom: 14
                      });
                    }
                    // Ensure terrain is enabled for 3D view with proper exaggeration
                    map.setTerrain({
                      source: 'mapbox-dem',
                      exaggeration: [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        10, 2.0,
                        14, 1.8,
                        18, 1.2
                      ]
                    });
                  } catch (error) {
                    // Terrain not available for this map style, silently continue
                  }

                  // Re-add SAFDZ layers immediately after style change
                  if (safdzData) {
                    const addSafdzLayersAfterStyleChange = () => {
                        try {
                          // Clean up any existing layers
                          if (map.getLayer('safdz-labels')) map.removeLayer('safdz-labels');
                          if (map.getLayer('safdz-outline')) map.removeLayer('safdz-outline');
                          if (map.getLayer('safdz-fill')) map.removeLayer('safdz-fill');
                          if (map.getLayer('safdz-fill-test')) map.removeLayer('safdz-fill-test');
                          if (map.getSource('safdz-zones')) map.removeSource('safdz-zones');

                          // Re-add source and layers
                          map.addSource('safdz-zones', {
                            type: 'geojson',
                            data: safdzData
                          });

                          // Re-add fill layer with current filters
                          map.addLayer({
                            id: 'safdz-fill',
                            type: 'fill',
                            source: 'safdz-zones',
                            filter: ['all',
                              // Size category filter
                              ['any',
                                ['all', ['>=', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.large], true]],
                                ['all', ['>=', ['get', 'HECTARES'], 50], ['<', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.medium], true]],
                                ['all', ['>=', ['get', 'HECTARES'], 20], ['<', ['get', 'HECTARES'], 50], ['==', ['literal', currentFilters.sizeCategories.small], true]],
                                ['all', ['<', ['get', 'HECTARES'], 20], ['==', ['literal', currentFilters.sizeCategories.micro], true]]
                              ],
                              // Hectare range filter
                              ['>=', ['get', 'HECTARES'], currentFilters.minHectares],
                              ['<=', ['get', 'HECTARES'], currentFilters.maxHectares],
                              // LMU category filter
                              ['any',
                                ['all', ['==', ['get', 'LMU_CODE'], '111'], ['==', ['literal', currentFilters.lmuCategories['111']], true]],
                                ['all', ['==', ['get', 'LMU_CODE'], '112'], ['==', ['literal', currentFilters.lmuCategories['112']], true]],
                                ['all', ['==', ['get', 'LMU_CODE'], '113'], ['==', ['literal', currentFilters.lmuCategories['113']], true]],
                                ['all', ['==', ['get', 'LMU_CODE'], '117'], ['==', ['literal', currentFilters.lmuCategories['117']], true]]
                              ],
                              // Zoning filter
                              ['any',
                                ['all', ['==', ['get', 'ZONING'], 'Strategic Agriculture'], ['==', ['literal', currentFilters.zoningTypes['Strategic Agriculture']], true]]
                              ],
                              // Land use filter
                              ['any',
                                ['all', ['==', ['get', 'LANDUSE'], 'Agriculture'], ['==', ['literal', currentFilters.landUseTypes['Agriculture']], true]]
                              ],
                              // Class filter
                              ['any',
                                ['all', ['==', ['get', 'CLASS'], 'rural'], ['==', ['literal', currentFilters.classTypes['rural']], true]]
                              ],
                              // Barangay filter (if any selected)
                              currentFilters.selectedBarangays && currentFilters.selectedBarangays.length > 0
                                ? ['in', ['get', 'BRGY'], ['literal', currentFilters.selectedBarangays]]
                                : ['literal', true],
                              // Search filter
                              currentFilters.searchBarangay
                                ? ['in', currentFilters.searchBarangay.toLowerCase(), ['downcase', ['get', 'BRGY']]]
                                : ['literal', true]
                            ],
                            paint: {
                              'fill-color': [
                                'case',
                                ['==', ['get', 'LMU_CODE'], '111'], '#22c55e', // Prime Agricultural Land - Green
                                ['==', ['get', 'LMU_CODE'], '112'], '#eab308', // Good Agricultural Land - Yellow
                                ['==', ['get', 'LMU_CODE'], '113'], '#f97316', // Fair Agricultural Land - Orange
                                ['==', ['get', 'LMU_CODE'], '117'], '#ef4444', // Marginal Agricultural Land - Red
                                '#94a3b8'                                       // Default - Gray for unknown
                              ],
                              'fill-opacity': 0.5,
                              'fill-antialias': false // Pixelated edges for consistency
                            }
                          });

                          // Re-add outline layer
                          map.addLayer({
                            id: 'safdz-outline',
                            type: 'line',
                            source: 'safdz-zones',
                            filter: ['all',
                              // Size category filter (same as fill layer)
                              ['any',
                                ['all', ['>=', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.large], true]],
                                ['all', ['>=', ['get', 'HECTARES'], 50], ['<', ['get', 'HECTARES'], 100], ['==', ['literal', currentFilters.sizeCategories.medium], true]],
                                ['all', ['>=', ['get', 'HECTARES'], 20], ['<', ['get', 'HECTARES'], 50], ['==', ['literal', currentFilters.sizeCategories.small], true]],
                                ['all', ['<', ['get', 'HECTARES'], 20], ['==', ['literal', currentFilters.sizeCategories.micro], true]]
                              ],
                              // Hectare range filter
                              ['>=', ['get', 'HECTARES'], currentFilters.minHectares],
                              ['<=', ['get', 'HECTARES'], currentFilters.maxHectares],
                              // LMU category filter
                              ['any',
                                ['all', ['==', ['get', 'LMU_CODE'], '111'], ['==', ['literal', currentFilters.lmuCategories['111']], true]],
                                ['all', ['==', ['get', 'LMU_CODE'], '112'], ['==', ['literal', currentFilters.lmuCategories['112']], true]],
                                ['all', ['==', ['get', 'LMU_CODE'], '113'], ['==', ['literal', currentFilters.lmuCategories['113']], true]],
                                ['all', ['==', ['get', 'LMU_CODE'], '117'], ['==', ['literal', currentFilters.lmuCategories['117']], true]]
                              ],
                              // Zoning filter
                              ['any',
                                ['all', ['==', ['get', 'ZONING'], 'Strategic Agriculture'], ['==', ['literal', currentFilters.zoningTypes['Strategic Agriculture']], true]]
                              ],
                              // Land use filter
                              ['any',
                                ['all', ['==', ['get', 'LANDUSE'], 'Agriculture'], ['==', ['literal', currentFilters.landUseTypes['Agriculture']], true]]
                              ],
                              // Class filter
                              ['any',
                                ['all', ['==', ['get', 'CLASS'], 'rural'], ['==', ['literal', currentFilters.classTypes['rural']], true]]
                              ],
                              // Barangay filter (if any selected)
                              currentFilters.selectedBarangays && currentFilters.selectedBarangays.length > 0
                                ? ['in', ['get', 'BRGY'], ['literal', currentFilters.selectedBarangays]]
                                : ['literal', true],
                              // Search filter
                              currentFilters.searchBarangay
                                ? ['in', currentFilters.searchBarangay.toLowerCase(), ['downcase', ['get', 'BRGY']]]
                                : ['literal', true]
                            ],
                            paint: {
                              'line-color': [
                                'case',
                                ['==', ['get', 'LMU_CODE'], '111'], '#16a34a', // Prime Agricultural Land - Dark Green
                                ['==', ['get', 'LMU_CODE'], '112'], '#ca8a04', // Good Agricultural Land - Dark Yellow
                                ['==', ['get', 'LMU_CODE'], '113'], '#ea580c', // Fair Agricultural Land - Dark Orange
                                ['==', ['get', 'LMU_CODE'], '117'], '#dc2626', // Marginal Agricultural Land - Dark Red
                                '#64748b'                                       // Default - Dark Gray for unknown
                              ],
                              'line-width': 1.5,
                              'line-opacity': 0.8
                            }
                          });

                          // Update visibility based on external SAFDZ toggle
                          const visibility = externalShowSafdzLayer ? 'visible' : 'none';
                          if (map.getLayer('safdz-fill')) {
                            map.setLayoutProperty('safdz-fill', 'visibility', visibility);
                          }
                          if (map.getLayer('safdz-outline')) {
                            map.setLayoutProperty('safdz-outline', 'visibility', visibility);
                          }

                        } catch (error) {
                          console.error('Error re-adding SAFDZ layers after style change:', error);
                        }
                      };

                    if (map.isStyleLoaded()) {
                      addSafdzLayersAfterStyleChange();
                    } else {
                      map.once('style.load', addSafdzLayersAfterStyleChange);
                    }
                  }

                  setViewState(currentViewState);
                  map.off('style.load', restoreView);
                };

                map.once('style.load', restoreView);
              }}
              className="px-3 py-2 bg-white/80 rounded-md shadow-sm border border-gray-300/50 hover:bg-white/90 transition-all duration-200 text-gray-700 font-medium text-sm"
            >
              {mapStyle === 'mapbox://styles/mapbox/satellite-v9' ? 'Streets' : 'Satellite'}
            </button>
          </div>
          
          
          {/* Zone Counter - only show when SAFDZ toggle is enabled */}
          {externalShowSafdzLayer && (safdzLoading || safdzError || safdzData) && (
            <div className="px-3 py-2 bg-gray-800/70 rounded-md shadow-sm border border-gray-600/50 text-white text-sm font-normal text-center">
              <div className="text-xs text-gray-300 mb-0.5">
                {safdzLoading ? 'Loading Zones...' : safdzError ? 'Error' : 'Total Zones'}
              </div>
              <div className="text-lg font-bold">
                {safdzLoading ? '...' : safdzError ? '!' : safdzData.features.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AgriculturalMapView3D.displayName = 'AgriculturalMapView3D';

export default AgriculturalMapView3D;
