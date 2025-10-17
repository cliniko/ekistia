/**
 * Earth Engine Service
 * Handles Google Earth Engine tile URL generation for AlphaEarth embeddings
 *
 * Note: This requires a backend service to authenticate with Earth Engine.
 * For now, we'll use pre-generated tile URLs or a proxy service.
 */

export interface AlphaEarthLayer {
  id: string;
  name: string;
  description: string;
  bands: string[];
  visualization: {
    min: number;
    max: number;
    palette: string[];
  };
  category: 'vegetation' | 'crops' | 'soil' | 'water' | 'general';
}

export interface EarthEngineTileConfig {
  urlTemplate: string;
  attribution: string;
  minzoom: number;
  maxzoom: number;
}

/**
 * AlphaEarth layer configurations focused on agriculture
 * Based on the 128-dimensional embedding bands (A00-A127)
 */
export const alphaEarthLayers: AlphaEarthLayer[] = [
  {
    id: 'crop-health',
    name: 'Crop Health Index',
    description: 'Vegetation health and crop vigor using NDVI-like bands',
    bands: ['A01', 'A16', 'A09'], // Vegetation-sensitive bands
    visualization: {
      min: -0.3,
      max: 0.3,
      palette: ['#8B4513', '#FFFF00', '#90EE90', '#006400'] // brown to dark green
    },
    category: 'crops'
  },
  {
    id: 'agricultural-land',
    name: 'Agricultural Land Classification',
    description: 'Identifies agricultural areas vs. urban/forest',
    bands: ['A05', 'A12', 'A23'], // Land use discrimination bands
    visualization: {
      min: -0.4,
      max: 0.4,
      palette: ['#A0522D', '#F4A460', '#FFD700', '#ADFF2F']
    },
    category: 'crops'
  },
  {
    id: 'soil-moisture',
    name: 'Soil Moisture Indicator',
    description: 'Soil moisture and water content estimation',
    bands: ['A07', 'A18', 'A11'], // Moisture-sensitive bands
    visualization: {
      min: -0.25,
      max: 0.25,
      palette: ['#8B0000', '#FF6347', '#87CEEB', '#0000CD']
    },
    category: 'soil'
  },
  {
    id: 'vegetation-type',
    name: 'Vegetation Type',
    description: 'Distinguishes different crop types and vegetation',
    bands: ['A03', 'A14', 'A21'], // Vegetation classification bands
    visualization: {
      min: -0.35,
      max: 0.35,
      palette: ['#DEB887', '#90EE90', '#228B22', '#006400']
    },
    category: 'vegetation'
  },
  {
    id: 'water-bodies',
    name: 'Water Bodies & Irrigation',
    description: 'Water features and irrigation systems',
    bands: ['A02', 'A08', 'A15'], // Water detection bands
    visualization: {
      min: -0.3,
      max: 0.3,
      palette: ['#FAEBD7', '#87CEEB', '#4169E1', '#00008B']
    },
    category: 'water'
  },
  {
    id: 'crop-stress',
    name: 'Crop Stress Detection',
    description: 'Identifies stressed or diseased crops',
    bands: ['A06', 'A13', 'A19'], // Stress indicator bands
    visualization: {
      min: -0.3,
      max: 0.3,
      palette: ['#006400', '#FFFF00', '#FFA500', '#FF0000']
    },
    category: 'crops'
  },
  {
    id: 'bare-soil',
    name: 'Bare Soil & Tilled Land',
    description: 'Exposed soil and recently tilled agricultural land',
    bands: ['A04', 'A10', 'A17'], // Bare soil detection bands
    visualization: {
      min: -0.35,
      max: 0.35,
      palette: ['#228B22', '#D2B48C', '#8B4513', '#654321']
    },
    category: 'soil'
  },
  {
    id: 'composite-agriculture',
    name: 'Agricultural Composite',
    description: 'Multi-band composite optimized for agriculture',
    bands: ['A01', 'A05', 'A09'], // Composite view
    visualization: {
      min: -0.4,
      max: 0.4,
      palette: ['#1a1a1a', '#4CAF50', '#FFEB3B', '#FF5722']
    },
    category: 'general'
  }
];

/**
 * Generate Earth Engine tile URL for AlphaEarth data
 *
 * IMPORTANT: This requires backend authentication with Google Earth Engine.
 * Options:
 * 1. Set up a backend service (Node.js/Python) with Earth Engine authentication
 * 2. Use Earth Engine's REST API with service account
 * 3. Use pre-computed tiles hosted elsewhere
 */
export const generateAlphaEarthTileUrl = async (
  layer: AlphaEarthLayer,
  bounds: { lat: number; lng: number }
): Promise<EarthEngineTileConfig | null> => {
  const EE_BACKEND_URL = import.meta.env.VITE_EE_BACKEND_URL;

  if (!EE_BACKEND_URL) {
    console.warn('Earth Engine backend URL not configured. Set VITE_EE_BACKEND_URL in .env');
    return null;
  }

  try {
    // Call your backend service that handles Earth Engine authentication
    const response = await fetch(`${EE_BACKEND_URL}/generate-tiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataset: 'GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL',
        dateRange: ['2024-01-01', '2024-12-31'],
        bounds: bounds,
        bands: layer.bands,
        visualization: layer.visualization,
      }),
    });

    if (!response.ok) {
      throw new Error(`EE backend error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      urlTemplate: data.urlTemplate,
      attribution: 'Google Earth Engine - AlphaEarth',
      minzoom: 8,
      maxzoom: 18,
    };
  } catch (error) {
    console.error('Failed to generate Earth Engine tiles:', error);
    return null;
  }
};

/**
 * Alternative: Use pre-computed tiles
 * If you have pre-rendered tiles hosted on a server
 */
export const getPrecomputedTileUrl = (layer: AlphaEarthLayer): EarthEngineTileConfig | null => {
  const TILE_SERVER_URL = import.meta.env.VITE_TILE_SERVER_URL;

  if (!TILE_SERVER_URL) {
    console.warn('Tile server URL not configured. Set VITE_TILE_SERVER_URL in .env');
    return null;
  }

  return {
    urlTemplate: `${TILE_SERVER_URL}/alphaearth/${layer.id}/{z}/{x}/{y}.png`,
    attribution: 'Google Earth Engine - AlphaEarth',
    minzoom: 8,
    maxzoom: 18,
  };
};

/**
 * Get layer by ID
 */
export const getAlphaEarthLayer = (layerId: string): AlphaEarthLayer | undefined => {
  return alphaEarthLayers.find(layer => layer.id === layerId);
};

/**
 * Get layers by category
 */
export const getLayersByCategory = (category: AlphaEarthLayer['category']): AlphaEarthLayer[] => {
  return alphaEarthLayers.filter(layer => layer.category === category);
};
