export type CropType = 'cacao' | 'banana' | 'mango' | 'coconut' | 'rice' | 'corn';
export type SuitabilityLevel = 'highly-suitable' | 'moderately-suitable' | 'low-suitable' | 'not-suitable';
export type StakeholderType = 'lgu' | 'landowner' | 'business' | 'investor';

export interface CropSuitability {
  crop: CropType;
  suitabilityLevel: SuitabilityLevel;
  suitableArea: number; // in hectares
}

export interface Barangay {
  id: string;
  name: string;
  totalArea: number; // in hectares
  agriculturalArea: number; // in hectares
  coordinates: number[][]; // polygon coordinates for boundary
  suitabilityData: CropSuitability[];
  priorityZone: boolean;
  availableLand: number; // land offered by farmers
  activeDemands: number; // business demands
  matchedArea?: number; // overlapping priority/supply/demand zones
}

export interface LandDemand {
  id: string;
  barangayId: string;
  crop: CropType;
  areaRequested: number;
  stakeholder: string;
  stakeholderType: StakeholderType;
  status: 'active' | 'matched' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdDate: string;
}

export interface LandOffer {
  id: string;
  barangayId: string;
  crop: CropType;
  areaOffered: number;
  landowner: string;
  status: 'available' | 'reserved' | 'leased';
  pricePerHectare?: number;
  createdDate: string;
}

export interface MatchedZone {
  id: string;
  barangayId: string;
  crop: CropType;
  matchedArea: number;
  lguPriority: boolean;
  landOffers: string[]; // LandOffer IDs
  businessDemands: string[]; // LandDemand IDs
  confidence: number; // 0-1 matching confidence
}