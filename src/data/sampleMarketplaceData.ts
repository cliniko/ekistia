import { LandDemand, LandOffer } from '@/types/agricultural';

export const sampleLandDemands: LandDemand[] = [
  {
    id: 'demand-1',
    barangayId: 'rogongon',
    crop: 'cacao',
    areaRequested: 50,
    stakeholder: 'Nestle Philippines',
    stakeholderType: 'business',
    status: 'active',
    priority: 'high',
    createdDate: '2024-01-15'
  },
  {
    id: 'demand-2',
    barangayId: 'panoroganan',
    crop: 'rice',
    areaRequested: 120,
    stakeholder: 'Iligan LGU',
    stakeholderType: 'lgu',
    status: 'active',
    priority: 'high',
    createdDate: '2024-01-20'
  },
  {
    id: 'demand-3',
    barangayId: 'mainit',
    crop: 'coconut',
    areaRequested: 75,
    stakeholder: 'Philippine Coconut Authority',
    stakeholderType: 'business',
    status: 'active',
    priority: 'medium',
    createdDate: '2024-02-01'
  },
  {
    id: 'demand-4',
    barangayId: 'abuno',
    crop: 'banana',
    areaRequested: 30,
    stakeholder: 'Del Monte Fresh Produce',
    stakeholderType: 'business',
    status: 'matched',
    priority: 'high',
    createdDate: '2024-01-10'
  },
  {
    id: 'demand-5',
    barangayId: 'bunawan',
    crop: 'corn',
    areaRequested: 80,
    stakeholder: 'Regional Agri Development',
    stakeholderType: 'investor',
    status: 'active',
    priority: 'medium',
    createdDate: '2024-02-05'
  }
];

export const sampleLandOffers: LandOffer[] = [
  {
    id: 'offer-1',
    barangayId: 'rogongon',
    crop: 'cacao',
    areaOffered: 45,
    landowner: 'Rodriguez Farm Cooperative',
    status: 'available',
    pricePerHectare: 850000,
    createdDate: '2024-01-18'
  },
  {
    id: 'offer-2',
    barangayId: 'panoroganan',
    crop: 'rice',
    areaOffered: 200,
    landowner: 'Mindanao Rice Farmers Assoc.',
    status: 'available',
    pricePerHectare: 1200000,
    createdDate: '2024-01-25'
  },
  {
    id: 'offer-3',
    barangayId: 'mainit',
    crop: 'coconut',
    areaOffered: 60,
    landowner: 'Santos Family Farm',
    status: 'reserved',
    pricePerHectare: 750000,
    createdDate: '2024-02-03'
  },
  {
    id: 'offer-4',
    barangayId: 'abuno',
    crop: 'banana',
    areaOffered: 35,
    landowner: 'Tropical Fruits Collective',
    status: 'leased',
    pricePerHectare: 950000,
    createdDate: '2024-01-12'
  },
  {
    id: 'offer-5',
    barangayId: 'kalilangan',
    crop: 'rice',
    areaOffered: 90,
    landowner: 'Kalilangan Farmers Union',
    status: 'available',
    createdDate: '2024-02-08'
  },
  {
    id: 'offer-6',
    barangayId: 'dulag',
    crop: 'mango',
    areaOffered: 25,
    landowner: 'Highland Mango Growers',
    status: 'available',
    pricePerHectare: 1100000,
    createdDate: '2024-02-10'
  }
];