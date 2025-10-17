import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp, ChevronDown, Upload, AlertTriangle } from "lucide-react";
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
  showCollectPanel = false
}: EkistiaHeaderProps) => {
  // Calculate header width based on open panels
  const getHeaderStyle = () => {
    if (showMapAnalytics || showCollectPanel || showHazardsPanel) {
      return 'fixed top-4 left-4 right-[400px] z-40 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl';
    }
    return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-7xl mx-auto rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl';
  };

  return (
    <header className={getHeaderStyle()}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Ekistia Logo"
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">Ekistia</h1>
              <p className="text-xs text-muted-foreground">Agricultural Development Mapping</p>
            </div>
          </div>
        </div>

        {/* Center: SAFDZ Filters & Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {/* SAFDZ Filter Dropdown */}
          {safdzFilters && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSafdzFilters}
                className="gap-2 bg-white/5 border-white/15 hover:bg-white/15 hover:border-white/25"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-3 h-3 transition-transform ${showSafdzFilters ? 'rotate-180' : ''}`} />
              </Button>

              {showSafdzFilters && (
                <div className="absolute top-full mt-2 w-96 bg-white/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-4 z-50">
                  {/* Agricultural Suitability */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground mb-2">Agricultural Suitability:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: '111', label: '111 - Prime' },
                        { key: '112', label: '112 - Good' },
                        { key: '113', label: '113 - Fair' },
                        { key: '117', label: '117 - Marginal' }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={safdzFilters.lmuCategories[key as keyof typeof safdzFilters.lmuCategories]}
                            onChange={(e) => onSafdzFiltersChange?.({
                              ...safdzFilters,
                              lmuCategories: {
                                ...safdzFilters.lmuCategories,
                                [key]: e.target.checked
                              }
                            })}
                            className="w-3 h-3"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Size Categories */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground mb-2">Land Area Categories:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'large', label: '>100 ha', color: '#dc2626' },
                        { key: 'medium', label: '50-100 ha', color: '#ea580c' },
                        { key: 'small', label: '20-50 ha', color: '#ca8a04' },
                        { key: 'micro', label: '<20 ha', color: '#16a34a' }
                      ].map(({ key, label, color }) => (
                        <label key={key} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={safdzFilters.sizeCategories[key as keyof typeof safdzFilters.sizeCategories]}
                            onChange={(e) => onSafdzFiltersChange?.({
                              ...safdzFilters,
                              sizeCategories: {
                                ...safdzFilters.sizeCategories,
                                [key]: e.target.checked
                              }
                            })}
                            className="w-3 h-3"
                          />
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: color }}></div>
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Hectare Range */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground mb-2">
                      Hectare Range: {safdzFilters.minHectares} - {safdzFilters.maxHectares} ha
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Min: {safdzFilters.minHectares} ha</label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={safdzFilters.minHectares}
                          onChange={(e) => onSafdzFiltersChange?.({
                            ...safdzFilters,
                            minHectares: parseInt(e.target.value)
                          })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Max: {safdzFilters.maxHectares} ha</label>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={safdzFilters.maxHectares}
                          onChange={(e) => onSafdzFiltersChange?.({
                            ...safdzFilters,
                            maxHectares: Math.max(parseInt(e.target.value), safdzFilters.minHectares + 1)
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-foreground block mb-2">Search Barangay:</label>
                    <input
                      type="text"
                      value={safdzFilters.searchBarangay}
                      onChange={(e) => onSafdzFiltersChange?.({
                        ...safdzFilters,
                        searchBarangay: e.target.value
                      })}
                      placeholder="Type barangay name..."
                      className="w-full px-2 py-1 text-xs bg-background border border-border rounded"
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
                  <button
                    onClick={() => onSafdzFiltersChange?.({
                      sizeCategories: { large: true, medium: true, small: true, micro: true },
                      minHectares: 0,
                      maxHectares: 1000,
                      searchBarangay: '',
                      lmuCategories: { '111': true, '112': true, '113': true, '117': true }
                    })}
                    className="w-full mt-3 px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dashboard Controls */}
          {toggleMapAnalytics && (
            <Button
              variant={showMapAnalytics ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapAnalytics}
              className={`gap-2 ${showMapAnalytics ? '' : 'bg-white/5 border-white/15 hover:bg-white/15 hover:border-white/25'}`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </Button>
          )}

          {toggleHazardsPanel && (
            <Button
              variant={showHazardsPanel ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleHazardsPanel}
              className={`gap-2 ${showHazardsPanel ? '' : 'bg-white/5 border-white/15 hover:bg-white/15 hover:border-white/25'}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Hazards
            </Button>
          )}

          {onCollectClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollectClick}
              className="gap-2 bg-white/5 border-white/15 hover:bg-white/15 hover:border-white/25"
            >
              <Upload className="w-4 h-4" />
              Collect
            </Button>
          )}

        </div>

      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/20 px-4 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* Mobile Dashboard Controls */}
          {toggleMapAnalytics && (
            <Button
              variant={showMapAnalytics ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapAnalytics}
              className="gap-1 text-xs whitespace-nowrap"
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
              className="gap-1 text-xs whitespace-nowrap"
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
              className="gap-1 text-xs whitespace-nowrap"
            >
              <Upload className="w-3 h-3" />
              Collect
            </Button>
          )}
        </div>
      </div>

    </header>
  );
};

export default EkistiaHeader;