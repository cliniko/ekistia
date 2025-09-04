import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LandDemand, LandOffer, CropType } from '@/types/agricultural';
import { Plus, Search, Building2, Users, Handshake, TrendingUp } from "lucide-react";

interface MarketplacePanelProps {
  demands: LandDemand[];
  offers: LandOffer[];
  onCreateDemand: (demand: Partial<LandDemand>) => void;
  onCreateOffer: (offer: Partial<LandOffer>) => void;
}

export const MarketplacePanel = ({ demands, offers, onCreateDemand, onCreateOffer }: MarketplacePanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<CropType | 'all'>('all');

  const cropOptions: { value: CropType | 'all'; label: string; emoji: string }[] = [
    { value: 'all', label: 'All Crops', emoji: '🌾' },
    { value: 'cacao', label: 'Cacao', emoji: '🍫' },
    { value: 'banana', label: 'Banana', emoji: '🍌' },
    { value: 'mango', label: 'Mango', emoji: '🥭' },
    { value: 'coconut', label: 'Coconut', emoji: '🥥' },
    { value: 'rice', label: 'Rice', emoji: '🌾' },
    { value: 'corn', label: 'Corn', emoji: '🌽' },
  ];

  const getCropEmoji = (crop: CropType): string => {
    const option = cropOptions.find(opt => opt.value === crop);
    return option?.emoji || '🌱';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'available': return 'bg-green-500';
      case 'matched': return 'bg-blue-500';
      case 'reserved': return 'bg-yellow-500';
      case 'leased': return 'bg-purple-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-muted-foreground';
    }
  };

  const filteredDemands = demands.filter(demand => {
    const matchesCrop = selectedCrop === 'all' || demand.crop === selectedCrop;
    const matchesSearch = searchTerm === '' || 
      demand.stakeholder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.crop.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  const filteredOffers = offers.filter(offer => {
    const matchesCrop = selectedCrop === 'all' || offer.crop === selectedCrop;
    const matchesSearch = searchTerm === '' || 
      offer.landowner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.crop.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  // Calculate marketplace stats
  const totalDemandedArea = demands.reduce((sum, d) => sum + d.areaRequested, 0);
  const totalOfferedArea = offers.reduce((sum, o) => sum + o.areaOffered, 0);
  const activeDemands = demands.filter(d => d.status === 'active').length;
  const availableOffers = offers.filter(o => o.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Agricultural Marketplace</h2>
        <p className="text-muted-foreground">
          Connect land demand with supply opportunities across Iligan City
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{activeDemands}</div>
                <div className="text-xs text-muted-foreground">Active Demands</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{availableOffers}</div>
                <div className="text-xs text-muted-foreground">Available Offers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalDemandedArea.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Demanded (ha)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalOfferedArea.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Offered (ha)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stakeholders, crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCrop} onValueChange={(value: CropType | 'all') => setSelectedCrop(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{cropOptions.find(opt => opt.value === selectedCrop)?.emoji}</span>
                <span>{cropOptions.find(opt => opt.value === selectedCrop)?.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {cropOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Marketplace Tabs */}
      <Tabs defaultValue="demands" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demands" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Land Demands ({filteredDemands.length})
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Land Offers ({filteredOffers.length})
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Handshake className="w-4 h-4" />
            Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demands" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Land Demands</h3>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Post Demand
            </Button>
          </div>
          
          <div className="grid gap-4">
            {filteredDemands.map((demand) => (
              <Card key={demand.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCropEmoji(demand.crop)}</div>
                      <div>
                        <h4 className="font-semibold text-foreground capitalize">
                          {demand.crop} Development Project
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          by {demand.stakeholder} • {demand.stakeholderType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(demand.priority)} variant="secondary">
                        {demand.priority} priority
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(demand.status)}`}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Area Requested</div>
                      <div className="font-semibold text-foreground">
                        {demand.areaRequested} ha
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="font-semibold text-foreground capitalize">
                        {demand.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Created</div>
                      <div className="font-semibold text-foreground">
                        {new Date(demand.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Barangay</div>
                      <div className="font-semibold text-foreground">
                        {demand.barangayId}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm">Contact Stakeholder</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredDemands.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                No land demands found matching your criteria.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Land Offers</h3>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Post Offer
            </Button>
          </div>
          
          <div className="grid gap-4">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCropEmoji(offer.crop)}</div>
                      <div>
                        <h4 className="font-semibold text-foreground capitalize">
                          {offer.crop} Suitable Land
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          by {offer.landowner}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(offer.status)}`}></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Area Offered</div>
                      <div className="font-semibold text-foreground">
                        {offer.areaOffered} ha
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-semibold text-foreground">
                        {offer.pricePerHectare ? `₱${offer.pricePerHectare.toLocaleString()}/ha` : 'Negotiable'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="font-semibold text-foreground capitalize">
                        {offer.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Listed</div>
                      <div className="font-semibold text-foreground">
                        {new Date(offer.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm">Contact Owner</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredOffers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                No land offers found matching your criteria.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <Handshake className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">AI Matching Engine</h3>
            <p className="max-w-md mx-auto">
              Our intelligent matching system identifies optimal alignments between land demand, 
              supply, and LGU priorities. Coming soon with advanced matching algorithms.
            </p>
            <Button className="mt-4" variant="outline">
              Enable Smart Matching
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplacePanel;