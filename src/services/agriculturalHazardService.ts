import type { HazardLayerConfig } from '@/components/AgriculturalHazardLayerControl';

// Hazard data URLs
const HAZARD_DATA_URLS = {
  flood: '/iligan_flood_hazard.geojson',
  landslide: '/iligan_landslide_hazard.geojson',
  slope: '/iligan_slope.geojson',
  landuse: '/iligan_landuse.geojson',
  ancestral: '/iligan_ancestral_domain.geojson'
} as const;

// Color schemes following International Hazard Standards & Conventions
// Each hazard type uses intuitive color families:
// FLOODS = Blue tones (water-related)
// LANDSLIDES = Brown/Orange/Red earth tones (ground movement)
// SLOPES = Green→Yellow→Orange→Red (safe to dangerous gradient)
// Intensity: Darker = Higher Risk
export const HAZARD_COLORS = {
  flood: {
    'VHF': '#1e3a8a', // Very High Flood - Dark Blue (SEVERE WATER HAZARD)
    'HF': '#2563eb',  // High Flood - Blue (HIGH WATER HAZARD)
    'MF': '#3b82f6',  // Medium Flood - Medium Blue (MODERATE WATER HAZARD)
    'LF': '#60a5fa'   // Low Flood - Light Blue (LOW WATER HAZARD)
  },
  landslide: {
    'VHL': '#7c2d12', // Very High Landslide - Dark Brown (EXTREME EARTH HAZARD)
    'HL': '#92400e',  // High Landslide - Brown (HIGH EARTH HAZARD)
    'ML': '#c2410c',  // Medium Landslide - Orange-Brown (MODERATE EARTH HAZARD)
    'LL': '#ea580c',  // Low Landslide - Orange (LOW EARTH HAZARD)
    'DF': '#991b1b'   // Debris Flow - Dark Red (CRITICAL FLOW HAZARD)
  },
  slope: {
    '0-3': '#d6d3d1',       // Nearly Level (0-3%) - Light Beige (SAFE - Gentle)
    '3-8': '#d4a373',       // Very Gently Sloping (3-8%) - Tan (MINIMAL RISK)
    '8-18': '#eab308',      // Gently to Moderately Sloping (8-18%) - Yellow (CAUTION)
    '18-30': '#f97316',     // Moderately to Strongly Sloping (18-30%) - Orange (WARNING)
    '31-50': '#dc2626',     // Strongly Sloping to Steep (31-50%) - Red (DANGER)
    '50 and above': '#991b1b' // Very Steep (50%+) - Dark Red (EXTREME DANGER)
  },
  landuse: {
    'Proposed Growth Area': '#3b82f6', // Blue - Development
    'Forestland': '#16a34a',           // Green - Forest
    'Agriculture': '#84cc16',          // Light Green - Farmland
    'Mineral Extraction': '#a855f7',   // Purple - Mining
    'Urban': '#ef4444'                 // Red - Urban areas
  },
  ancestral: '#8b5cf6' // Purple - Cultural Heritage
} as const;

// Opacity levels based on hazard severity (higher hazard = more opaque and visible)
export const HAZARD_OPACITY = {
  flood: {
    'VHF': 0.9,   // Very High - Most opaque for maximum visibility
    'HF': 0.75,   // High
    'MF': 0.6,    // Medium
    'LF': 0.45    // Low
  },
  landslide: {
    'VHL': 0.9,   // Very High - Most opaque
    'HL': 0.75,   // High
    'ML': 0.6,    // Medium
    'LL': 0.45,   // Low
    'DF': 0.85    // Debris Flow - High visibility
  },
  slope: {
    '0-3': 0.3,     // Very gentle slopes - lower opacity
    '3-8': 0.35,
    '8-18': 0.5,
    '18-30': 0.65,
    '31-50': 0.8,
    '50 and above': 0.9
  }
} as const;

// Cache for loaded data
const hazardDataCache = new Map<string, any>();

/**
 * Load hazard GeoJSON data
 */
export async function loadHazardData(hazardType: keyof typeof HAZARD_DATA_URLS): Promise<any> {
  const cacheKey = hazardType;

  // Return cached data if available
  if (hazardDataCache.has(cacheKey)) {
    return hazardDataCache.get(cacheKey);
  }

  const url = HAZARD_DATA_URLS[hazardType];

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${hazardType} hazard data: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the data
    hazardDataCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error loading ${hazardType} hazard data:`, error);
    throw error;
  }
}

/**
 * Initialize hazard layer configurations
 */
export async function initializeHazardLayers(): Promise<HazardLayerConfig[]> {
  const layers: HazardLayerConfig[] = [];

  try {
    // Load flood data
    const floodData = await loadHazardData('flood');
    const floodCounts = countByProperty(floodData, 'FloodSusc');
    layers.push({
      id: 'flood',
      name: 'Flood Hazard Zones',
      icon: '🌊',
      enabled: false,
      opacity: 0.5,
      color: '#2563eb', // Blue for water-related hazard
      featureCount: floodData.features.length,
      categories: [
        { id: 'VHF', name: 'Very High Flood', color: HAZARD_COLORS.flood.VHF, count: floodCounts['VHF'] || 0, enabled: true },
        { id: 'HF', name: 'High Flood', color: HAZARD_COLORS.flood.HF, count: floodCounts['HF'] || 0, enabled: true },
        { id: 'MF', name: 'Medium Flood', color: HAZARD_COLORS.flood.MF, count: floodCounts['MF'] || 0, enabled: true },
        { id: 'LF', name: 'Low Flood', color: HAZARD_COLORS.flood.LF, count: floodCounts['LF'] || 0, enabled: true }
      ]
    });

    // Load landslide data
    const landslideData = await loadHazardData('landslide');
    const landslideCounts = countByProperty(landslideData, 'LndslideSu');
    layers.push({
      id: 'landslide',
      name: 'Landslide Susceptibility',
      icon: '⛰️',
      enabled: false,
      opacity: 0.5,
      color: '#92400e', // Brown for earth/ground-related hazard
      featureCount: landslideData.features.length,
      categories: [
        { id: 'VHL', name: 'Very High Landslide', color: HAZARD_COLORS.landslide.VHL, count: landslideCounts['VHL'] || 0, enabled: true },
        { id: 'HL', name: 'High Landslide', color: HAZARD_COLORS.landslide.HL, count: landslideCounts['HL'] || 0, enabled: true },
        { id: 'ML', name: 'Medium Landslide', color: HAZARD_COLORS.landslide.ML, count: landslideCounts['ML'] || 0, enabled: true },
        { id: 'LL', name: 'Low Landslide', color: HAZARD_COLORS.landslide.LL, count: landslideCounts['LL'] || 0, enabled: true },
        { id: 'DF', name: 'Debris Flow', color: HAZARD_COLORS.landslide.DF, count: landslideCounts['DF'] || 0, enabled: true }
      ]
    });

    // Load slope data
    const slopeData = await loadHazardData('slope');
    layers.push({
      id: 'slope',
      name: 'Slope Analysis',
      icon: '📐',
      enabled: false,
      opacity: 0.5,
      color: '#f97316',
      featureCount: slopeData.features.length
    });

    // Load land use data
    const landuseData = await loadHazardData('landuse');
    layers.push({
      id: 'landuse',
      name: 'Land Use Classification',
      icon: '🏗️',
      enabled: false,
      opacity: 0.5,
      color: '#84cc16',
      featureCount: landuseData.features.length
    });

    // Load ancestral domain data
    const ancestralData = await loadHazardData('ancestral');
    layers.push({
      id: 'ancestral',
      name: 'Ancestral Domain',
      icon: '🏞️',
      enabled: false,
      opacity: 0.6,
      color: '#8b5cf6',
      featureCount: ancestralData.features.length
    });

  } catch (error) {
    console.error('Error initializing hazard layers:', error);
  }

  return layers;
}

/**
 * Count features by property value
 */
function countByProperty(data: any, propertyName: string): Record<string, number> {
  const counts: Record<string, number> = {};
  
  data.features.forEach((feature: any) => {
    const value = feature.properties[propertyName];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return counts;
}

/**
 * Get Mapbox style for flood layer (Pixelated Grid Style with category-based opacity)
 */
export function getFloodLayerStyle(opacity: number, enabledCategories: string[]) {
  return {
    'fill-color': [
      'match',
      ['get', 'FloodSusc'],
      'VHF', HAZARD_COLORS.flood.VHF,
      'HF', HAZARD_COLORS.flood.HF,
      'MF', HAZARD_COLORS.flood.MF,
      'LF', HAZARD_COLORS.flood.LF,
      '#6b7280'
    ],
    'fill-opacity': [
      '*',
      [
        'match',
        ['get', 'FloodSusc'],
        'VHF', HAZARD_OPACITY.flood.VHF,
        'HF', HAZARD_OPACITY.flood.HF,
        'MF', HAZARD_OPACITY.flood.MF,
        'LF', HAZARD_OPACITY.flood.LF,
        0.5
      ],
      opacity // Multiply by global opacity for layer control
    ],
    'fill-antialias': false // Disable antialiasing for sharper pixel edges
  };
}

/**
 * Get Mapbox filter for flood layer
 */
export function getFloodLayerFilter(enabledCategories: string[]) {
  if (enabledCategories.length === 0) {
    return ['==', 'FloodSusc', '']; // Show nothing
  }
  if (enabledCategories.length === 4) {
    return ['has', 'FloodSusc']; // Show all
  }
  return ['in', ['get', 'FloodSusc'], ['literal', enabledCategories]];
}

/**
 * Get Mapbox style for landslide layer (Pixelated Grid Style with category-based opacity)
 */
export function getLandslideLayerStyle(opacity: number) {
  return {
    'fill-color': [
      'match',
      ['get', 'LndslideSu'],
      'VHL', HAZARD_COLORS.landslide.VHL,
      'HL', HAZARD_COLORS.landslide.HL,
      'ML', HAZARD_COLORS.landslide.ML,
      'LL', HAZARD_COLORS.landslide.LL,
      'DF', HAZARD_COLORS.landslide.DF,
      '#6b7280'
    ],
    'fill-opacity': [
      '*',
      [
        'match',
        ['get', 'LndslideSu'],
        'VHL', HAZARD_OPACITY.landslide.VHL,
        'HL', HAZARD_OPACITY.landslide.HL,
        'ML', HAZARD_OPACITY.landslide.ML,
        'LL', HAZARD_OPACITY.landslide.LL,
        'DF', HAZARD_OPACITY.landslide.DF,
        0.5
      ],
      opacity // Multiply by global opacity for layer control
    ],
    'fill-antialias': false // Disable antialiasing for sharper pixel edges
  };
}

/**
 * Get Mapbox filter for landslide layer
 */
export function getLandslideLayerFilter(enabledCategories: string[]) {
  if (enabledCategories.length === 0) {
    return ['==', 'LndslideSu', '']; // Show nothing
  }
  if (enabledCategories.length === 5) {
    return ['has', 'LndslideSu']; // Show all
  }
  return ['in', ['get', 'LndslideSu'], ['literal', enabledCategories]];
}

/**
 * Get Mapbox style for slope layer (Pixelated Grid Style with category-based opacity)
 */
export function getSlopeLayerStyle(opacity: number) {
  return {
    'fill-color': [
      'match',
      ['get', 'SLOPE'],
      '0-3', HAZARD_COLORS.slope['0-3'],
      '3-8', HAZARD_COLORS.slope['3-8'],
      '8-18', HAZARD_COLORS.slope['8-18'],
      '18-30', HAZARD_COLORS.slope['18-30'],
      '31-50', HAZARD_COLORS.slope['31-50'],
      '50 and above', HAZARD_COLORS.slope['50 and above'],
      '#6b7280'
    ],
    'fill-opacity': [
      '*',
      [
        'match',
        ['get', 'SLOPE'],
        '0-3', HAZARD_OPACITY.slope['0-3'],
        '3-8', HAZARD_OPACITY.slope['3-8'],
        '8-18', HAZARD_OPACITY.slope['8-18'],
        '18-30', HAZARD_OPACITY.slope['18-30'],
        '31-50', HAZARD_OPACITY.slope['31-50'],
        '50 and above', HAZARD_OPACITY.slope['50 and above'],
        0.5
      ],
      opacity // Multiply by global opacity for layer control
    ],
    'fill-antialias': false // Disable antialiasing for sharper pixel edges
  };
}

/**
 * Get Mapbox style for land use layer (Pixelated Grid Style)
 */
export function getLanduseLayerStyle(opacity: number) {
  return {
    'fill-color': [
      'match',
      ['get', 'LANDUSE'],
      'Proposed Growth Area', HAZARD_COLORS.landuse['Proposed Growth Area'],
      'Forestland', HAZARD_COLORS.landuse['Forestland'],
      'Agriculture', HAZARD_COLORS.landuse['Agriculture'],
      'Mineral Extraction', HAZARD_COLORS.landuse['Mineral Extraction'],
      'Urban', HAZARD_COLORS.landuse['Urban'],
      '#6b7280'
    ],
    'fill-opacity': opacity,
    'fill-antialias': false // Disable antialiasing for sharper pixel edges
  };
}

/**
 * Get Mapbox style for ancestral domain layer (Pixelated Grid Style)
 */
export function getAncestralLayerStyle(opacity: number) {
  return {
    'fill-color': HAZARD_COLORS.ancestral,
    'fill-opacity': opacity,
    'fill-antialias': false // Disable antialiasing for sharper pixel edges
  };
}

/**
 * Get popup content for hazard feature
 */
export function getHazardPopupContent(layerType: string, properties: any): string {
  const formatArea = (area?: number) => area ? `${(area / 10000).toFixed(2)} ha` : 'N/A';

  switch (layerType) {
    case 'flood':
      const floodLevel = {
        'VHF': 'Very High',
        'HF': 'High',
        'MF': 'Medium',
        'LF': 'Low'
      }[properties.FloodSusc] || properties.FloodSusc;
      
      return `
        <div class="text-sm p-2">
          <div class="font-bold text-base mb-2 text-red-600">🌊 Flood Hazard Zone</div>
          <div class="space-y-1">
            <div><strong>Risk Level:</strong> ${floodLevel}</div>
            <div><strong>Area:</strong> ${formatArea(properties.Shape_Area)}</div>
            <div><strong>Updated:</strong> ${properties.Updated || 'N/A'}</div>
            ${properties.Remarks ? `<div><strong>Remarks:</strong> ${properties.Remarks}</div>` : ''}
          </div>
        </div>
      `;

    case 'landslide':
      const landslideLevel = {
        'VHL': 'Very High',
        'HL': 'High',
        'ML': 'Medium',
        'LL': 'Low',
        'DF': 'Debris Flow'
      }[properties.LndslideSu] || properties.LndslideSu;
      
      return `
        <div class="text-sm p-2">
          <div class="font-bold text-base mb-2 text-orange-600">🏔️ Landslide Zone</div>
          <div class="space-y-1">
            <div><strong>Susceptibility:</strong> ${landslideLevel}</div>
            <div><strong>Area:</strong> ${formatArea(properties.Shape_Area)}</div>
            <div><strong>Updated:</strong> ${properties.Updated || 'N/A'}</div>
          </div>
        </div>
      `;

    case 'slope':
      return `
        <div class="text-sm p-2">
          <div class="font-bold text-base mb-2 text-yellow-600">📐 Slope Analysis</div>
          <div class="space-y-1">
            <div><strong>Slope:</strong> ${properties.SLOPE}%</div>
            <div><strong>Description:</strong> ${properties.DESCRIPT || 'N/A'}</div>
            <div><strong>Area:</strong> ${properties.AREA?.toFixed(2) || 'N/A'} sq units</div>
          </div>
        </div>
      `;

    case 'landuse':
      return `
        <div class="text-sm p-2">
          <div class="font-bold text-base mb-2 text-green-600">🏗️ Land Use</div>
          <div class="space-y-1">
            <div><strong>Type:</strong> ${properties.LANDUSE}</div>
            <div><strong>Barangay:</strong> ${properties.BRGY || 'N/A'}</div>
            <div><strong>Area:</strong> ${properties.HECTARES?.toFixed(2) || 'N/A'} ha</div>
            <div><strong>Classification:</strong> ${properties.CLASSIFICA || 'N/A'}</div>
            <div><strong>Class:</strong> ${properties.CLASS || 'N/A'}</div>
          </div>
        </div>
      `;

    case 'ancestral':
      return `
        <div class="text-sm p-2">
          <div class="font-bold text-base mb-2 text-purple-600">🏞️ Ancestral Domain</div>
          <div class="space-y-1">
            <div><strong>Area:</strong> ${(properties.area / 10000).toFixed(2)} ha</div>
            <div class="text-xs text-gray-600 mt-2">Protected indigenous territory</div>
          </div>
        </div>
      `;

    default:
      return '<div class="text-sm p-2">Hazard Information</div>';
  }
}

