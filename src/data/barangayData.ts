import { Barangay, CropSuitability } from '@/types/agricultural';

// Sample barangay boundary coordinates (simplified for demo)
// In production, these would be loaded from GeoJSON files
const generateSampleCoordinates = (centerLat: number, centerLng: number): number[][] => {
  const offset = 0.01;
  return [
    [centerLng - offset, centerLat - offset],
    [centerLng + offset, centerLat - offset],
    [centerLng + offset, centerLat + offset],
    [centerLng - offset, centerLat + offset],
    [centerLng - offset, centerLat - offset]
  ];
};

// Iligan City center coordinates for positioning barangays
const iliganCenter = { lat: 8.228, lng: 124.2452 };

export const barangayData: Barangay[] = [
  {
    id: 'abuno',
    name: 'Abuno',
    totalArea: 664.87,
    agriculturalArea: 420,
    coordinates: generateSampleCoordinates(iliganCenter.lat + 0.05, iliganCenter.lng - 0.03),
    suitabilityData: [
      { crop: 'cacao', suitabilityLevel: 'highly-suitable', suitableArea: 262.09 },
      { crop: 'banana', suitabilityLevel: 'highly-suitable', suitableArea: 200 },
      { crop: 'coconut', suitabilityLevel: 'moderately-suitable', suitableArea: 150 }
    ],
    priorityZone: true,
    availableLand: 180,
    activeDemands: 2
  },
  {
    id: 'bonbonon',
    name: 'Bonbonon',
    totalArea: 424.13,
    agriculturalArea: 151,
    coordinates: generateSampleCoordinates(iliganCenter.lat - 0.02, iliganCenter.lng + 0.04),
    suitabilityData: [
      { crop: 'cacao', suitabilityLevel: 'highly-suitable', suitableArea: 191.44 },
      { crop: 'mango', suitabilityLevel: 'moderately-suitable', suitableArea: 100 }
    ],
    priorityZone: false,
    availableLand: 85,
    activeDemands: 1
  },
  {
    id: 'bunawan',
    name: 'Bunawan',
    totalArea: 2195.20,
    agriculturalArea: 366,
    coordinates: generateSampleCoordinates(iliganCenter.lat + 0.08, iliganCenter.lng + 0.02),
    suitabilityData: [
      { crop: 'rice', suitabilityLevel: 'highly-suitable', suitableArea: 245.50 },
      { crop: 'corn', suitabilityLevel: 'highly-suitable', suitableArea: 180 }
    ],
    priorityZone: true,
    availableLand: 220,
    activeDemands: 3
  },
  {
    id: 'buru-un',
    name: 'Buru-un',
    totalArea: 1000.72,
    agriculturalArea: 747,
    coordinates: generateSampleCoordinates(iliganCenter.lat - 0.04, iliganCenter.lng - 0.05),
    suitabilityData: [
      { crop: 'coconut', suitabilityLevel: 'highly-suitable', suitableArea: 258.04 },
      { crop: 'banana', suitabilityLevel: 'highly-suitable', suitableArea: 200 }
    ],
    priorityZone: false,
    availableLand: 320,
    activeDemands: 2
  },
  {
    id: 'dalipuga',
    name: 'Dalipuga',
    totalArea: 971.06,
    agriculturalArea: 202,
    coordinates: generateSampleCoordinates(iliganCenter.lat, iliganCenter.lng),
    suitabilityData: [
      { crop: 'cacao', suitabilityLevel: 'low-suitable', suitableArea: 41.01 },
      { crop: 'mango', suitabilityLevel: 'moderately-suitable', suitableArea: 80 }
    ],
    priorityZone: false,
    availableLand: 45,
    activeDemands: 1
  },
  {
    id: 'rogongon',
    name: 'Rogongon',
    totalArea: 35555.29,
    agriculturalArea: 19642,
    coordinates: generateSampleCoordinates(iliganCenter.lat + 0.12, iliganCenter.lng - 0.08),
    suitabilityData: [
      { crop: 'cacao', suitabilityLevel: 'highly-suitable', suitableArea: 6183.91 },
      { crop: 'coconut', suitabilityLevel: 'highly-suitable', suitableArea: 5500 },
      { crop: 'banana', suitabilityLevel: 'highly-suitable', suitableArea: 4200 }
    ],
    priorityZone: true,
    availableLand: 8500,
    activeDemands: 12,
    matchedArea: 2800
  },
  {
    id: 'panoroganan',
    name: 'Panoroganan',
    totalArea: 10500,
    agriculturalArea: 8916,
    coordinates: generateSampleCoordinates(iliganCenter.lat - 0.08, iliganCenter.lng + 0.08),
    suitabilityData: [
      { crop: 'rice', suitabilityLevel: 'highly-suitable', suitableArea: 9347.23 },
      { crop: 'corn', suitabilityLevel: 'highly-suitable', suitableArea: 3200 }
    ],
    priorityZone: true,
    availableLand: 4200,
    activeDemands: 8,
    matchedArea: 1800
  },
  {
    id: 'mainit',
    name: 'Mainit',
    totalArea: 7325,
    agriculturalArea: 2956,
    coordinates: generateSampleCoordinates(iliganCenter.lat + 0.06, iliganCenter.lng + 0.06),
    suitabilityData: [
      { crop: 'cacao', suitabilityLevel: 'highly-suitable', suitableArea: 789.68 },
      { crop: 'coconut', suitabilityLevel: 'highly-suitable', suitableArea: 600 }
    ],
    priorityZone: false,
    availableLand: 1200,
    activeDemands: 4
  },
  {
    id: 'kalilangan',
    name: 'Kalilangan',
    totalArea: 3500,
    agriculturalArea: 2592,
    coordinates: generateSampleCoordinates(iliganCenter.lat - 0.06, iliganCenter.lng - 0.02),
    suitabilityData: [
      { crop: 'rice', suitabilityLevel: 'highly-suitable', suitableArea: 419.84 },
      { crop: 'corn', suitabilityLevel: 'moderately-suitable', suitableArea: 800 }
    ],
    priorityZone: true,
    availableLand: 1400,
    activeDemands: 3
  },
  {
    id: 'dulag',
    name: 'Dulag',
    totalArea: 3000,
    agriculturalArea: 1154,
    coordinates: generateSampleCoordinates(iliganCenter.lat + 0.03, iliganCenter.lng - 0.06),
    suitabilityData: [
      { crop: 'banana', suitabilityLevel: 'highly-suitable', suitableArea: 896.78 },
      { crop: 'cacao', suitabilityLevel: 'highly-suitable', suitableArea: 434.88 }
    ],
    priorityZone: false,
    availableLand: 680,
    activeDemands: 2
  }
];

export const getCropSuitabilityForBarangay = (barangayId: string, crop: string): number => {
  const barangay = barangayData.find(b => b.id === barangayId);
  if (!barangay) return 0;
  
  const suitability = barangay.suitabilityData.find(s => s.crop === crop);
  return suitability ? suitability.suitableArea : 0;
};

export const getSuitabilityLevel = (barangayId: string, crop: string): string => {
  const barangay = barangayData.find(b => b.id === barangayId);
  if (!barangay) return 'not-suitable';
  
  const suitability = barangay.suitabilityData.find(s => s.crop === crop);
  return suitability ? suitability.suitabilityLevel : 'not-suitable';
};