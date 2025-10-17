import { HazardData, HazardLayer, HazardType } from '@/types';

// Hazard data URLs (GeoJSON files in public directory)
const HAZARD_DATA_URLS = {
  flood: '/iligan_flood_hazard.geojson',
  landslide: '/iligan_landslide_hazard.geojson',
  slope: '/iligan_slope.geojson',
  landuse: '/iligan_landuse.geojson',
  ancestral_domain: '/iligan_ancestral_domain.geojson'
} as const;

// Color schemes for different hazard types
export const HAZARD_COLOR_SCHEMES = {
  flood: {
    'HF': '#dc2626', // Red for High Flood
    'MF': '#f59e0b', // Orange for Medium Flood
    'LF': '#10b981'  // Green for Low Flood
  },
  landslide: {
    'VH': '#7f1d1d', // Dark red for Very High
    'H': '#dc2626',  // Red for High
    'M': '#f59e0b',  // Orange for Medium
    'L': '#10b981'   // Green for Low
  },
  slope: {
    'flat': '#10b981',        // Green
    'gentle': '#84cc16',      // Light green
    'moderate': '#eab308',    // Yellow
    'steep': '#f97316',       // Orange
    'very_steep': '#dc2626'   // Red
  },
  landuse: {
    default: '#6b7280' // Gray
  },
  ancestral_domain: {
    default: '#8b5cf6' // Purple
  }
} as const;

// Hazard layer definitions
export const hazardLayers: Omit<HazardLayer, 'data'>[] = [
  {
    id: 'flood',
    name: 'Flood Hazard Zones',
    type: 'flood',
    visible: false,
    opacity: 0.7,
    colorScheme: Object.values(HAZARD_COLOR_SCHEMES.flood),
    description: 'Areas prone to flooding based on historical data and topography'
  },
  {
    id: 'landslide',
    name: 'Landslide Susceptibility',
    type: 'landslide',
    visible: false,
    opacity: 0.7,
    colorScheme: Object.values(HAZARD_COLOR_SCHEMES.landslide),
    description: 'Areas with varying degrees of landslide risk'
  },
  {
    id: 'slope',
    name: 'Slope Analysis',
    type: 'slope',
    visible: false,
    opacity: 0.7,
    colorScheme: Object.values(HAZARD_COLOR_SCHEMES.slope),
    description: 'Terrain slope classification for land assessment'
  },
  {
    id: 'landuse',
    name: 'Land Use Classification',
    type: 'landuse',
    visible: false,
    opacity: 0.7,
    colorScheme: [HAZARD_COLOR_SCHEMES.landuse.default],
    description: 'Current land use patterns and classifications'
  },
  {
    id: 'ancestral_domain',
    name: 'Ancestral Domain',
    type: 'ancestral_domain',
    visible: false,
    opacity: 0.7,
    colorScheme: [HAZARD_COLOR_SCHEMES.ancestral_domain.default],
    description: 'Indigenous ancestral domain boundaries'
  }
];

// Cache for loaded hazard data
const hazardDataCache = new Map<string, HazardData>();

/**
 * Load hazard data from GeoJSON file
 */
export async function loadHazardData(hazardType: HazardType): Promise<HazardData> {
  const cacheKey = hazardType;

  // Return cached data if available
  if (hazardDataCache.has(cacheKey)) {
    console.log(`✅ Using cached data for ${hazardType}`);
    return hazardDataCache.get(cacheKey)!;
  }

  const url = HAZARD_DATA_URLS[hazardType];

  try {
    console.log(`⏳ Loading hazard data for ${hazardType} from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load hazard data for ${hazardType}: ${response.statusText}`);
    }

    const data: HazardData = await response.json();
    console.log(`✅ Loaded ${data.features?.length || 0} features for ${hazardType}`);

    // Cache the data
    hazardDataCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`❌ Error loading hazard data for ${hazardType}:`, error);
    throw error;
  }
}

/**
 * Load all hazard layers with their data
 */
export async function loadAllHazardLayers(): Promise<HazardLayer[]> {
  const layers: HazardLayer[] = [];

  for (const layer of hazardLayers) {
    try {
      const data = await loadHazardData(layer.type);
      layers.push({
        ...layer,
        data
      });
    } catch (error) {
      console.warn(`Failed to load hazard layer ${layer.id}:`, error);
      // Continue with other layers
    }
  }

  return layers;
}

/**
 * Get color for a hazard feature based on its properties
 */
export function getHazardFeatureColor(
  hazardType: HazardType,
  properties: any
): string {
  const colorScheme = HAZARD_COLOR_SCHEMES[hazardType];

  switch (hazardType) {
    case 'flood':
      return colorScheme[properties.FloodSusc as keyof typeof colorScheme] || colorScheme.LF;

    case 'landslide':
      // Property name is truncated to "LndslideSu" in the GeoJSON
      const landslideRisk = properties.LndslideSu || properties.LandslideSusc;
      
      // Map the values: HL = H (High), ML = M (Medium), LL = L (Low), VHL = VH (Very High)
      let riskLevel = landslideRisk;
      if (landslideRisk === 'HL') riskLevel = 'H';
      else if (landslideRisk === 'ML') riskLevel = 'M';
      else if (landslideRisk === 'LL') riskLevel = 'L';
      else if (landslideRisk === 'VHL') riskLevel = 'VH';
      
      return colorScheme[riskLevel as keyof typeof colorScheme] || colorScheme.L;

    case 'slope':
      // For slope data, SLOPE contains a range string like "8-18"
      const slopeStr = properties.SLOPE || properties.slope || '0';
      let slopeValue = 0;
      
      // Parse slope range string to get the max value
      if (typeof slopeStr === 'string') {
        const match = slopeStr.match(/(\d+)-(\d+)/);
        if (match) {
          slopeValue = parseInt(match[2]); // Use the max value of the range
        } else {
          slopeValue = parseInt(slopeStr) || 0;
        }
      } else {
        slopeValue = Number(slopeStr) || 0;
      }
      
      if (slopeValue < 5) return colorScheme.flat;
      if (slopeValue < 15) return colorScheme.gentle;
      if (slopeValue < 30) return colorScheme.moderate;
      if (slopeValue < 45) return colorScheme.steep;
      return colorScheme.very_steep;

    case 'landuse':
      // Land use colors would be more complex - for now use default
      return colorScheme.default;

    case 'ancestral_domain':
      return colorScheme.default;

    default:
      return '#6b7280'; // Default gray
  }
}

/**
 * Get style function for Leaflet GeoJSON layer
 */
export function getHazardStyleFunction(hazardType: HazardType, opacity: number = 0.7) {
  return (feature: any) => {
    const fillColor = getHazardFeatureColor(hazardType, feature.properties);

    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: opacity
    };
  };
}

/**
 * Get popup content for hazard features
 */
export function getHazardPopupContent(hazardType: HazardType, properties: any): string {
  const formatArea = (area?: number) => area ? `${(area / 1000000).toFixed(2)} km²` : 'N/A';
  const formatLength = (length?: number) => length ? `${length.toFixed(2)} m` : 'N/A';

  switch (hazardType) {
    case 'flood':
      const floodRisk = properties.FloodSusc || 'Unknown';
      const floodRiskLabel = floodRisk === 'HF' ? 'High' : floodRisk === 'MF' ? 'Medium' : floodRisk === 'LF' ? 'Low' : floodRisk;
      return `
        <div class="text-sm">
          <strong>Flood Hazard Zone</strong><br>
          <strong>Risk Level:</strong> ${floodRiskLabel}<br>
          <strong>Area:</strong> ${formatArea(properties.Shape_Area)}<br>
          <strong>Updated:</strong> ${properties.Updated || 'Unknown'}
        </div>
      `;

    case 'landslide':
      const landslideRisk = properties.LndslideSu || properties.LandslideSusc || 'Unknown';
      const landslideRiskLabel = landslideRisk === 'HL' || landslideRisk === 'H' ? 'High' : 
                                  landslideRisk === 'ML' || landslideRisk === 'M' ? 'Medium' : 
                                  landslideRisk === 'LL' || landslideRisk === 'L' ? 'Low' :
                                  landslideRisk === 'VHL' || landslideRisk === 'VH' ? 'Very High' : landslideRisk;
      return `
        <div class="text-sm">
          <strong>Landslide Zone</strong><br>
          <strong>Susceptibility:</strong> ${landslideRiskLabel}<br>
          <strong>Area:</strong> ${formatArea(properties.Shape_Area)}<br>
          <strong>Updated:</strong> ${properties.Updated || 'Unknown'}
        </div>
      `;

    case 'slope':
      const slopeValue = properties.SLOPE || properties.slope || 'Unknown';
      const slopeDesc = properties.DESCRIPT || '';
      return `
        <div class="text-sm">
          <strong>Slope Analysis</strong><br>
          <strong>Slope:</strong> ${slopeValue}°${slopeDesc ? ` (${slopeDesc})` : ''}<br>
          <strong>Area:</strong> ${formatArea(properties.Shape_Area)}<br>
          <strong>Code:</strong> ${properties.CODE || 'N/A'}
        </div>
      `;

    case 'landuse':
      return `
        <div class="text-sm">
          <strong>Land Use Classification</strong><br>
          <strong>Type:</strong> ${properties.LANDUSE || properties.landuse || 'Unknown'}<br>
          <strong>Area:</strong> ${formatArea(properties.Shape_Area)}<br>
          <strong>Perimeter:</strong> ${formatLength(properties.Shape_Leng)}
        </div>
      `;

    case 'ancestral_domain':
      return `
        <div class="text-sm">
          <strong>Ancestral Domain</strong><br>
          <strong>Name:</strong> ${properties.NAME || properties.name || 'Unknown'}<br>
          <strong>Area:</strong> ${formatArea(properties.Shape_Area)}<br>
          <strong>Perimeter:</strong> ${formatLength(properties.Shape_Leng)}
        </div>
      `;

    default:
      return '<div class="text-sm">Hazard Information</div>';
  }
}
