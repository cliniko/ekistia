
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'reported' | 'inspected' | 'scheduled' | 'in-progress' | 'completed';

export interface GaussianSplattingData {
  pointCloud?: {
    density: number;
    points: number;
    accuracy: number;
  };
  surface?: {
    depth: number;
    width: number;
    area: number;
  };
  classification?: {
    confidence: number;
    model: string;
    scan_date: string;
  };
  gaussianData?: {
    url: string;
    pointSize: number;
  };
}

export interface Pothole {
  id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  severity: Severity;
  status: Status;
  detectionAccuracy: number;
  reportDate: string;
  scheduledRepairDate?: string;
  completionDate?: string;
  images: string[];
  description?: string;
  reportedBy?: string;
  lidarData?: GaussianSplattingData;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'maintenance' | 'inspector' | 'reporter';
  avatar?: string;
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

// Hazard Data Types
export type HazardType = 'flood' | 'landslide' | 'slope' | 'landuse' | 'ancestral_domain';

export type FloodSusceptibility = 'HF' | 'MF' | 'LF'; // High Flood, Medium Flood, Low Flood
export type LandslideSusceptibility = 'VH' | 'H' | 'M' | 'L'; // Very High, High, Medium, Low
export type SlopeCategory = 'flat' | 'gentle' | 'moderate' | 'steep' | 'very_steep';
export type LandUseType = string; // Will be determined from the data

export interface HazardFeatureProperties {
  FloodSusc?: FloodSusceptibility;
  LandslideSusc?: LandslideSusceptibility;
  SlopeCategory?: SlopeCategory;
  LandUse?: LandUseType;
  AncestralDomain?: string;
  Shape_Leng?: number;
  Shape_Area?: number;
  created_us?: string;
  created_da?: string;
  last_edite?: string;
  last_edi_1?: string;
  GlobalID?: string;
  Updated?: string;
  Published?: string;
  Remarks?: string;
}

export interface HazardFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: HazardFeatureProperties;
}

export interface HazardData {
  type: 'FeatureCollection';
  features: HazardFeature[];
}

export interface HazardLayer {
  id: string;
  name: string;
  type: HazardType;
  data: HazardData;
  visible: boolean;
  opacity: number;
  colorScheme: string[];
  description: string;
}

export interface HazardLayerState {
  enabledLayers: string[];
  opacity: number;
}
