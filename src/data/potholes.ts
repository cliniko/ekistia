
import { Pothole } from '@/types';

export const potholes: Pothole[] = [
  {
    id: 'ph-001',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '350 5th Ave, New York, NY 10118'
    },
    severity: 'high',
    status: 'reported',
    detectionAccuracy: 0.92,
    reportDate: '2025-04-15T08:30:00Z',
    images: ['/placeholder.svg'],
    description: 'Large pothole causing traffic slowdowns during rush hour'
  },
  {
    id: 'ph-002',
    location: {
      lat: 40.7082,
      lng: -73.9982,
      address: '175 5th Ave, New York, NY 10010'
    },
    severity: 'medium',
    status: 'scheduled',
    detectionAccuracy: 0.87,
    reportDate: '2025-04-12T14:15:00Z',
    scheduledRepairDate: '2025-05-10T09:00:00Z',
    images: ['/placeholder.svg'],
    description: 'Medium-sized pothole near pedestrian crossing'
  },
  {
    id: 'ph-003',
    location: {
      lat: 40.7112,
      lng: -74.0156,
      address: '55 Water St, New York, NY 10041'
    },
    severity: 'critical',
    status: 'in-progress',
    detectionAccuracy: 0.95,
    reportDate: '2025-04-10T11:45:00Z',
    scheduledRepairDate: '2025-05-01T08:00:00Z',
    images: ['/placeholder.svg'],
    description: 'Deep pothole causing damage to multiple vehicles'
  },
  {
    id: 'ph-004',
    location: {
      lat: 40.7234,
      lng: -73.9985,
      address: '405 Lexington Ave, New York, NY 10174'
    },
    severity: 'low',
    status: 'completed',
    detectionAccuracy: 0.81,
    reportDate: '2025-04-05T09:20:00Z',
    scheduledRepairDate: '2025-04-25T10:00:00Z',
    completionDate: '2025-04-27T14:30:00Z',
    images: ['/placeholder.svg'],
    description: 'Small pothole repaired ahead of schedule'
  },
  {
    id: 'ph-005',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: '45 Rockefeller Plaza, New York, NY 10111'
    },
    severity: 'high',
    status: 'inspected',
    detectionAccuracy: 0.89,
    reportDate: '2025-04-18T13:10:00Z',
    images: ['/placeholder.svg'],
    description: 'Pothole in high-traffic area causing congestion'
  },
  {
    id: 'ph-006',
    location: {
      lat: 40.7527,
      lng: -73.9772,
      address: '230 Park Ave, New York, NY 10169'
    },
    severity: 'medium',
    status: 'reported',
    detectionAccuracy: 0.84,
    reportDate: '2025-04-20T16:05:00Z',
    images: ['/placeholder.svg'],
    description: 'Pothole near bus stop affecting public transportation'
  }
];
