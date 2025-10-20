/**
 * SAFDZ (Strategic Agriculture and Fisheries Development Zones) Classifications
 * Based on official SAFDZ mapping and color scheme
 */

export interface SafdzClassification {
  code: string;
  label: string;
  description: string;
  color: string;
  darkColor: string; // For borders/outlines
}

/**
 * SAFDZ Classification Mapping
 * Based on the official SAFDZ classes with corresponding color codes
 */
export const SAFDZ_CLASSIFICATIONS: Record<string, SafdzClassification> = {
  '1': {
    code: '1',
    label: 'Strategic CCP Sub-development Zone',
    description: 'Commercial Crop Production Zone',
    color: '#90EE90', // light green
    darkColor: '#32CD32'
  },
  '2': {
    code: '2',
    label: 'Strategic Livestock Sub-development Zone',
    description: 'Livestock Production Zone',
    color: '#6B46C1', // dark purple
    darkColor: '#553C9A'
  },
  '3': {
    code: '3',
    label: 'Strategic Fishery Sub-development Zone',
    description: 'Fishery Production Zone',
    color: '#ADD8E6', // light blue
    darkColor: '#5F9EA0'
  },
  '4': {
    code: '4',
    label: 'Strategic Integrated Crop/Livestock Sub-development Zone',
    description: 'Integrated Crop and Livestock Production Zone',
    color: '#98D98E', // green-yellow mix
    darkColor: '#7CB342'
  },
  '5': {
    code: '5',
    label: 'Strategic Integrated Crop/Fishery Sub-development Zone',
    description: 'Integrated Crop and Fishery Production Zone',
    color: '#9ED9CC', // cyan-green
    darkColor: '#26A69A'
  },
  '6': {
    code: '6',
    label: 'Strategic Integrated Crop/Livestock/Fishery Sub-development Zone',
    description: 'Integrated Crop, Livestock and Fishery Production Zone',
    color: '#B0BEC5', // blue-gray
    darkColor: '#78909C'
  },
  '7': {
    code: '7',
    label: 'Strategic Integrated Fishery and Livestock Sub-development Zone',
    description: 'Integrated Fishery and Livestock Production Zone',
    color: '#8FA3C4', // purple-blue
    darkColor: '#5C6BC0'
  },
  '8': {
    code: '8',
    label: 'NIPAS',
    description: 'National Integrated Protected Areas System',
    color: '#DDA0DD', // pink/violet
    darkColor: '#BA55D3'
  },
  '9': {
    code: '9',
    label: 'Rangelands/PAAD',
    description: 'Rangelands/Public Alienable and Disposable',
    color: '#FFA500', // orange
    darkColor: '#FF8C00'
  },
  '10': {
    code: '10',
    label: 'Sub-watershed/Forestry Zone',
    description: 'Sub-watershed and Forest Protection Zone',
    color: '#2F4F2F', // dark green
    darkColor: '#1B371B'
  },
  'BU': {
    code: 'BU',
    label: 'Built-Up Areas',
    description: 'Urban and Built-Up Areas',
    color: '#808080', // gray
    darkColor: '#505050'
  },
  'WB': {
    code: 'WB',
    label: 'Water Bodies',
    description: 'Rivers, Lakes, and Water Bodies',
    color: '#4682B4', // steel blue
    darkColor: '#27496D'
  },
  'Others': {
    code: 'Others',
    label: 'Others',
    description: 'Other Land Classifications',
    color: '#D3D3D3', // light gray
    darkColor: '#A9A9A9'
  }
};

/**
 * Get SAFDZ classification for a given code
 * Handles mixed classifications (e.g., "9 / BU", "10 / BU")
 */
export function getSafdzClassification(code: string): SafdzClassification {
  // Handle empty or null codes
  if (!code || code.trim() === '') {
    return SAFDZ_CLASSIFICATIONS['Others'];
  }

  // Clean the code
  const cleanCode = code.trim();

  // Check for exact match first
  if (SAFDZ_CLASSIFICATIONS[cleanCode]) {
    return SAFDZ_CLASSIFICATIONS[cleanCode];
  }

  // Handle mixed classifications (e.g., "9 / BU", "10 / BU")
  // Take the first part before the slash
  if (cleanCode.includes('/')) {
    const primaryCode = cleanCode.split('/')[0].trim();
    if (SAFDZ_CLASSIFICATIONS[primaryCode]) {
      return SAFDZ_CLASSIFICATIONS[primaryCode];
    }
  }

  // Default to Others if no match
  return SAFDZ_CLASSIFICATIONS['Others'];
}

/**
 * Get all SAFDZ classifications as an array
 */
export function getAllSafdzClassifications(): SafdzClassification[] {
  return Object.values(SAFDZ_CLASSIFICATIONS);
}

/**
 * Get color for a given SAFDZ code
 */
export function getSafdzColor(code: string): string {
  return getSafdzClassification(code).color;
}

/**
 * Get dark color (for borders) for a given SAFDZ code
 */
export function getSafdzDarkColor(code: string): string {
  return getSafdzClassification(code).darkColor;
}

