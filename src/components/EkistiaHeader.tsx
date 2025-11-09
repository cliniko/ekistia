import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, TrendingUp, ChevronDown, Upload, AlertTriangle, Sparkles } from "lucide-react";
import { AIQueryModal } from './AIQueryModal';
import logo from './ekistia_logo.png';

interface EkistiaHeaderProps {
  // SAFDZ Filter props
  safdzFilters?: {
    sizeCategories: { large: boolean; medium: boolean; small: boolean; micro: boolean };
    minHectares: number;
    maxHectares: number;
    searchBarangay: string;
    lmuCategories: { '111': boolean; '112': boolean; '113': boolean; '117': boolean };
  };
  onSafdzFiltersChange?: (filters: any) => void;
  safdzData?: { features: any[] };
  showSafdzFilters?: boolean;
  toggleSafdzFilters?: () => void;
  // Dashboard control props
  showMapAnalytics?: boolean;
  toggleMapAnalytics?: () => void;
  // Hazards panel props
  showHazardsPanel?: boolean;
  toggleHazardsPanel?: () => void;
  // Collect panel props
  onCollectClick?: () => void;
  showCollectPanel?: boolean;
  // AI results callback
  onAIResultsGenerated?: (results: any) => void;
}

export const EkistiaHeader = ({
  safdzFilters,
  onSafdzFiltersChange,
  safdzData,
  showSafdzFilters = false,
  toggleSafdzFilters,
  showMapAnalytics = false,
  toggleMapAnalytics,
  showHazardsPanel = false,
  toggleHazardsPanel,
  onCollectClick,
  showCollectPanel = false,
  onAIResultsGenerated
}: EkistiaHeaderProps) => {
  const [showAIModal, setShowAIModal] = useState(false);

  // Calculate header width based on open panels
  const getHeaderStyle = () => {
    if (showMapAnalytics || showCollectPanel || showHazardsPanel) {
      // On tablets (md), use more conservative spacing; on larger screens (lg+), use full panel width
      return 'fixed top-4 left-4 right-4 md:right-[420px] lg:right-[420px] z-40 rounded-xl bg-white/90 border border-gray-200 shadow-2xl transition-all duration-300';
    }
    return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-7xl mx-auto rounded-xl bg-white/90 border border-gray-200 shadow-2xl transition-all duration-300';
  };

  return (
    <header className={getHeaderStyle()}>
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 gap-2">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={logo}
              alt="Ekistia Logo"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">Ekistia</h1>
              <p className={`text-xs text-muted-foreground ${(showMapAnalytics || showCollectPanel || showHazardsPanel) ? 'hidden lg:block' : 'hidden sm:block'}`}>Agricultural Development Mapping</p>
            </div>
          </div>
        </div>

        {/* Right: SAFDZ Filters & Navigation */}
        <div className={`hidden md:flex items-center gap-1 md:gap-2 lg:gap-3 flex-shrink-0 justify-end min-w-0 ${(showMapAnalytics || showCollectPanel || showHazardsPanel) ? 'flex-wrap justify-end' : ''}`}>
          {/* SAFDZ Filter Dropdown - Hide when side panels are open */}
          {safdzFilters && !(showMapAnalytics || showCollectPanel || showHazardsPanel) && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSafdzFilters}
                className="gap-1 md:gap-2 bg-white/10 border-gray-300 hover:bg-gray-50 text-xs md:text-sm flex-shrink-0"
              >
                <Filter className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden md:inline">Filters</span>
                <span className="md:hidden">Filter</span>
                <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${showSafdzFilters ? 'rotate-180' : ''}`} />
              </Button>

              {showSafdzFilters && (
                <Card className="absolute top-full mt-2 md:mt-8 left-0 md:left-auto right-0 md:right-auto w-[calc(100vw-2rem)] md:w-96 max-w-[calc(100vw-2rem)] md:max-w-none shadow-2xl z-50">
                  <CardContent className="p-3 md:p-4">
                    {/* Agricultural Suitability */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Agricultural Suitability:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: '111', label: '111 - Prime' },
                          { key: '112', label: '112 - Good' },
                          { key: '113', label: '113 - Fair' },
                          { key: '117', label: '117 - Marginal' }
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`lmu-${key}`}
                              checked={safdzFilters.lmuCategories[key as keyof typeof safdzFilters.lmuCategories]}
                              onCheckedChange={(checked) => onSafdzFiltersChange?.({
                                ...safdzFilters,
                                lmuCategories: {
                                  ...safdzFilters.lmuCategories,
                                  [key]: checked
                                }
                              })}
                            />
                            <Label htmlFor={`lmu-${key}`} className="text-xs cursor-pointer">
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Size Categories */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Land Area Categories:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'large', label: '>100 ha', color: '#dc2626' },
                          { key: 'medium', label: '50-100 ha', color: '#ea580c' },
                          { key: 'small', label: '20-50 ha', color: '#ca8a04' },
                          { key: 'micro', label: '<20 ha', color: '#16a34a' }
                        ].map(({ key, label, color }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`size-${key}`}
                              checked={safdzFilters.sizeCategories[key as keyof typeof safdzFilters.sizeCategories]}
                              onCheckedChange={(checked) => onSafdzFiltersChange?.({
                                ...safdzFilters,
                                sizeCategories: {
                                  ...safdzFilters.sizeCategories,
                                  [key]: checked
                                }
                              })}
                            />
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: color }}></div>
                            <Label htmlFor={`size-${key}`} className="text-xs cursor-pointer">
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hectare Range */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">
                        Hectare Range: {safdzFilters.minHectares} - {safdzFilters.maxHectares} ha
                      </Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Min: {safdzFilters.minHectares} ha</Label>
                          <Slider
                            value={[safdzFilters.minHectares]}
                            onValueChange={(value) => onSafdzFiltersChange?.({
                              ...safdzFilters,
                              minHectares: value[0]
                            })}
                            max={200}
                            min={0}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Max: {safdzFilters.maxHectares} ha</Label>
                          <Slider
                            value={[safdzFilters.maxHectares]}
                            onValueChange={(value) => onSafdzFiltersChange?.({
                              ...safdzFilters,
                              maxHectares: Math.max(value[0], safdzFilters.minHectares + 1)
                            })}
                            max={500}
                            min={0}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                      <Label htmlFor="search-barangay" className="text-sm font-medium mb-2 block">Search Barangay:</Label>
                      <Input
                        id="search-barangay"
                        type="text"
                        value={safdzFilters.searchBarangay}
                        onChange={(e) => onSafdzFiltersChange?.({
                          ...safdzFilters,
                          searchBarangay: e.target.value
                        })}
                        placeholder="Type barangay name..."
                        className="text-xs"
                      />
                    </div>

                    {/* Statistics */}
                    {safdzData && safdzData.features && (
                      <div className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                        {(() => {
                          const filteredFeatures = safdzData.features.filter((f: any) => {
                            const hectares = f.properties.HECTARES || 0;
                            const lmuCode = f.properties.LMU_CODE || '';

                            const matchesSize =
                              (hectares >= 100 && safdzFilters.sizeCategories.large) ||
                              (hectares >= 50 && hectares < 100 && safdzFilters.sizeCategories.medium) ||
                              (hectares >= 20 && hectares < 50 && safdzFilters.sizeCategories.small) ||
                              (hectares < 20 && safdzFilters.sizeCategories.micro);

                            const matchesRange = hectares >= safdzFilters.minHectares && hectares <= safdzFilters.maxHectares;
                            const matchesLmu = safdzFilters.lmuCategories[lmuCode as keyof typeof safdzFilters.lmuCategories];
                            const matchesSearch = !safdzFilters.searchBarangay ||
                              f.properties.BRGY.toLowerCase().includes(safdzFilters.searchBarangay.toLowerCase());

                            return matchesSize && matchesRange && matchesLmu && matchesSearch;
                          });
                          const totalHectares = filteredFeatures.reduce((sum: number, f: any) => sum + (f.properties.HECTARES || 0), 0);
                          return `${filteredFeatures.length} zones • ${totalHectares.toFixed(1)} ha total`;
                        })()}
                      </div>
                    )}

                    {/* Clear Filters */}
                    <Button
                      onClick={() => onSafdzFiltersChange?.({
                        sizeCategories: { large: true, medium: true, small: true, micro: true },
                        minHectares: 0,
                        maxHectares: 1000,
                        searchBarangay: '',
                        lmuCategories: { '111': true, '112': true, '113': true, '117': true }
                      })}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Dashboard Controls */}
          {toggleMapAnalytics && (
            <Button
              variant={showMapAnalytics ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapAnalytics}
              className={`gap-1 text-xs md:text-sm flex-shrink-0 ${showMapAnalytics ? '' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
            >
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden xl:inline">Analytics</span>
              <span className="xl:hidden">Stats</span>
            </Button>
          )}

          {toggleHazardsPanel && (
            <Button
              variant={showHazardsPanel ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleHazardsPanel}
              className={`gap-1 text-xs md:text-sm flex-shrink-0 ${showHazardsPanel ? '' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
            >
              <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden lg:inline">Hazards</span>
              <span className="lg:hidden">Haz</span>
            </Button>
          )}

          {onCollectClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollectClick}
              className="gap-1 text-xs md:text-sm bg-gray-100 border-gray-300 hover:bg-gray-200 flex-shrink-0"
            >
              <Upload className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden lg:inline">Collect</span>
              <span className="lg:hidden">Col</span>
            </Button>
          )}

          {/* AI Mode Button */}
          <Button
            onClick={() => setShowAIModal(true)}
            size="sm"
            className="gap-1 text-xs md:text-sm bg-gray-900 hover:bg-gray-800 text-white flex-shrink-0"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden xl:inline">AI Mode</span>
            <span className="xl:hidden">AI</span>
          </Button>

        </div>

      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 px-4 py-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {/* Mobile Dashboard Controls */}
          {toggleMapAnalytics && (
            <Button
              variant={showMapAnalytics ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapAnalytics}
              className="gap-1 text-xs whitespace-nowrap flex-shrink-0"
            >
              <TrendingUp className="w-3 h-3" />
              Analytics
            </Button>
          )}

          {toggleHazardsPanel && (
            <Button
              variant={showHazardsPanel ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleHazardsPanel}
              className="gap-1 text-xs whitespace-nowrap flex-shrink-0"
            >
              <AlertTriangle className="w-3 h-3" />
              Hazards
            </Button>
          )}

          {onCollectClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollectClick}
              className="gap-1 text-xs whitespace-nowrap flex-shrink-0"
            >
              <Upload className="w-3 h-3" />
              Collect
            </Button>
          )}

          {/* AI Mode Button - Mobile */}
          <Button
            onClick={() => setShowAIModal(true)}
            size="sm"
            className="gap-1 text-xs whitespace-nowrap bg-gray-900 hover:bg-gray-800 text-white flex-shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            AI
          </Button>
        </div>
      </div>

      <AIQueryModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onResultsGenerated={(results) => {
          onAIResultsGenerated?.(results);
        }}
      />
    </header>
  );
};

export default EkistiaHeader;