import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CropType, SuitabilityLevel } from '@/types/agricultural';
import { RotateCcw, Sprout } from "lucide-react";

interface CropFiltersProps {
  selectedCrop: CropType | 'all';
  suitabilityFilter: SuitabilityLevel | 'all';
  onCropChange: (crop: CropType | 'all') => void;
  onSuitabilityChange: (level: SuitabilityLevel | 'all') => void;
  onClearFilters: () => void;
  totalBarangays: number;
  filteredCount: number;
}

const cropOptions: { value: CropType | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Crops', emoji: '🌾' },
  { value: 'cacao', label: 'Cacao', emoji: '🍫' },
  { value: 'banana', label: 'Banana', emoji: '🍌' },
  { value: 'mango', label: 'Mango', emoji: '🥭' },
  { value: 'coconut', label: 'Coconut', emoji: '🥥' },
  { value: 'rice', label: 'Rice', emoji: '🌾' },
  { value: 'corn', label: 'Corn', emoji: '🌽' },
];

const suitabilityOptions: { value: SuitabilityLevel | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Levels', color: 'bg-muted' },
  { value: 'highly-suitable', label: 'Highly Suitable', color: 'bg-green-500' },
  { value: 'moderately-suitable', label: 'Moderately Suitable', color: 'bg-yellow-500' },
  { value: 'low-suitable', label: 'Low Suitable', color: 'bg-orange-500' },
  { value: 'not-suitable', label: 'Not Suitable', color: 'bg-red-500' },
];

export const CropFilters = ({
  selectedCrop,
  suitabilityFilter,
  onCropChange,
  onSuitabilityChange,
  onClearFilters,
  totalBarangays,
  filteredCount
}: CropFiltersProps) => {
  const selectedCropOption = cropOptions.find(option => option.value === selectedCrop);
  const selectedSuitabilityOption = suitabilityOptions.find(option => option.value === suitabilityFilter);

  return (
    <Card className="w-full shadow-md border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sprout className="w-5 h-5 text-primary" />
          Crop Suitability Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Crop Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Crop</label>
          <Select value={selectedCrop} onValueChange={onCropChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{selectedCropOption?.emoji}</span>
                  <span>{selectedCropOption?.label}</span>
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

        {/* Suitability Level Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Suitability Level</label>
          <Select value={suitabilityFilter} onValueChange={onSuitabilityChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedSuitabilityOption?.color}`}></div>
                  <span>{selectedSuitabilityOption?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {suitabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Results */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="text-xs w-fit">
              Showing {filteredCount} of {totalBarangays} barangays
            </Badge>
            {(selectedCrop !== 'all' || suitabilityFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClearFilters}
                className="text-xs w-fit px-2 h-7"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCrop !== 'all' || suitabilityFilter !== 'all') && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {selectedCrop !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {selectedCropOption?.emoji} {selectedCropOption?.label}
              </Badge>
            )}
            {suitabilityFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                <div className={`w-2 h-2 rounded-full ${selectedSuitabilityOption?.color} mr-1`}></div>
                {selectedSuitabilityOption?.label}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropFilters;