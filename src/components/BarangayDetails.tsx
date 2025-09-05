import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Barangay, CropType, SuitabilityLevel } from '@/types/agricultural';
import { X, MapPin, Sprout, Users, Building2, TrendingUp } from "lucide-react";

interface BarangayDetailsProps {
  barangay: Barangay;
  selectedCrop?: CropType | 'all';
  onClose: () => void;
}

export const BarangayDetails = ({ barangay, selectedCrop, onClose }: BarangayDetailsProps) => {
  // Unified color system that matches the map boundaries
  const getSuitabilityHexColor = (level: SuitabilityLevel): string => {
    switch (level) {
      case 'highly-suitable': return '#22c55e'; // Green
      case 'moderately-suitable': return '#eab308'; // Yellow
      case 'low-suitable': return '#f97316'; // Orange
      case 'not-suitable': return '#ef4444'; // Red
      default: return '#94a3b8'; // Gray
    }
  };

  const getSuitabilityColor = (level: string): string => {
    switch (level) {
      case 'highly-suitable': return 'bg-green-500';
      case 'moderately-suitable': return 'bg-yellow-500';
      case 'low-suitable': return 'bg-orange-500';
      case 'not-suitable': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  // Get suitability level for the selected crop (matching map logic)
  const getBarangaySuitability = (barangay: Barangay, crop: CropType | 'all'): { level: SuitabilityLevel; area: number } => {
    if (crop === 'all') {
      // Find the best suitability across all crops
      let bestLevel: SuitabilityLevel = 'not-suitable';
      let totalArea = 0;
      
      for (const suitability of barangay.suitabilityData) {
        totalArea += suitability.suitableArea;
        if (suitability.suitabilityLevel === 'highly-suitable' && bestLevel !== 'highly-suitable') {
          bestLevel = 'highly-suitable';
        } else if (suitability.suitabilityLevel === 'moderately-suitable' && bestLevel === 'not-suitable') {
          bestLevel = 'moderately-suitable';
        }
      }
      
      return { level: bestLevel, area: totalArea };
    }
    
    const cropSuitability = barangay.suitabilityData.find(s => s.crop === crop);
    return cropSuitability 
      ? { level: cropSuitability.suitabilityLevel, area: cropSuitability.suitableArea }
      : { level: 'not-suitable', area: 0 };
  };

  // Calculate the boundary color for this barangay
  const currentSuitability = getBarangaySuitability(barangay, selectedCrop || 'all');
  let boundaryColor = getSuitabilityHexColor(currentSuitability.level);
  let isMatchedZone = false;

  // Special styling for matched zones (matches map logic)
  if (barangay.matchedArea && barangay.matchedArea > 0) {
    boundaryColor = '#8b5cf6'; // Purple for matched zones
    isMatchedZone = true;
  }

  const getSuitabilityLabel = (level: string): string => {
    return level.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCropEmoji = (crop: CropType): string => {
    const emojiMap: Record<CropType, string> = {
      'cacao': '🍫',
      'banana': '🍌',
      'mango': '🥭',
      'coconut': '🥥',
      'rice': '🌾',
      'corn': '🌽'
    };
    return emojiMap[crop] || '🌱';
  };

  const utilizationRate = (barangay.agriculturalArea / barangay.totalArea) * 100;

  return (
    <Card 
      className="w-full max-w-md shadow-lg border-2 border-border/50" 
      style={{ 
        borderColor: boundaryColor,
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px ${boundaryColor}20`
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle className="text-foreground">{barangay.name}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Land Area Overview
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 p-2 rounded">
              <div className="text-muted-foreground">Total Area</div>
              <div className="font-semibold text-foreground">{barangay.totalArea.toLocaleString()} ha</div>
            </div>
            <div className="bg-muted/50 p-2 rounded">
              <div className="text-muted-foreground">Agricultural</div>
              <div className="font-semibold text-foreground">{barangay.agriculturalArea.toLocaleString()} ha</div>
            </div>
          </div>
          <div className="bg-muted/50 p-2 rounded text-xs">
            <div className="text-muted-foreground">Agricultural Utilization</div>
            <div className="font-semibold text-foreground">{utilizationRate.toFixed(1)}%</div>
          </div>
        </div>

        <Separator />

        {/* Development Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            Development Status
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 p-2 rounded">
              <div className="text-muted-foreground">Available Land</div>
              <div className="font-semibold text-foreground">{barangay.availableLand} ha</div>
            </div>
            <div className="bg-muted/50 p-2 rounded">
              <div className="text-muted-foreground">Active Demands</div>
              <div className="font-semibold text-foreground">{barangay.activeDemands}</div>
            </div>
          </div>
          {barangay.priorityZone && (
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              LGU Priority Zone
            </Badge>
          )}
          {barangay.matchedArea && barangay.matchedArea > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-200 dark:border-purple-800">
              <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                Matched Development Zone
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                {barangay.matchedArea} ha with active stakeholder alignment
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Crop Suitability */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-1">
            <Sprout className="w-4 h-4" />
            Crop Suitability Analysis
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {barangay.suitabilityData.length > 0 ? (
              barangay.suitabilityData.map((crop, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded border transition-colors ${
                    selectedCrop === crop.crop 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCropEmoji(crop.crop)}</span>
                      <span className="text-sm font-medium text-foreground capitalize">
                        {crop.crop}
                      </span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getSuitabilityColor(crop.suitabilityLevel)}`}></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getSuitabilityLabel(crop.suitabilityLevel)} • {crop.suitableArea.toFixed(1)} ha
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground italic text-center py-4">
                No crop suitability data available
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 text-xs">
            View Details
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            Add to Watchlist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarangayDetails;