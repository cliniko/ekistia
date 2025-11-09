import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import EkistiaHeader from '@/components/EkistiaHeader';
import AgriculturalMapView3D from '@/components/AgriculturalMapView3D';
import BarangayDetails from '@/components/BarangayDetails';
import MapAnalyticsDashboard from '@/components/MapAnalyticsDashboard';
import CollectDataPanel from '@/components/CollectDataPanel';
import HazardPanel from '@/components/HazardPanel';
import LoadingScreen from '@/components/LoadingScreen';
import type { HazardLayerConfig } from '@/components/AgriculturalHazardLayerControl';
import { barangayData } from '@/data/barangayData';
import { Barangay, CropType } from '@/types/agricultural';
import { SAFDZ_CLASSIFICATIONS } from '@/types/safdz';

const EkistiaIndex = React.memo(() => {
  const [barangays] = useState<Barangay[]>(barangayData);
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropType | 'all'>('all');
  const isMobile = useIsMobile();

  // SAFDZ filter state
  const [safdzFilters, setSafdzFilters] = useState({
    sizeCategories: {
      large: true,
      medium: true,
      small: true,
      micro: true
    },
    minHectares: 0,
    maxHectares: 1000,
    searchBarangay: '',
    lmuCategories: {
      '111': true, // Prime Agricultural Land
      '112': true, // Good Agricultural Land
      '113': true, // Fair Agricultural Land
      '117': true  // Marginal Agricultural Land
    },
    safdzZoneTypes: {
      '1': true,   // Strategic CCP - enabled by default
      '2': false,  // Strategic Livestock
      '3': false,  // Strategic Fishery
      '4': false,  // Integrated Crop/Livestock
      '5': false,  // Integrated Crop/Fishery
      '6': false,  // Integrated Crop/Livestock/Fishery
      '7': false,  // Integrated Fishery/Livestock
      '8': false,  // NIPAS
      '9': false,  // Rangelands/PAAD
      '10': false, // Sub-watershed/Forestry
      'BU': false, // Built-Up Areas
      'WB': false  // Water Bodies
    },
    zoningTypes: {
      'Strategic Agriculture': true
    },
    landUseTypes: {
      'Agriculture': true
    },
    classTypes: {
      'rural': true
    }
  });
  const [showSafdzFilters, setShowSafdzFilters] = useState(false);
  const [showMapAnalytics, setShowMapAnalytics] = useState(false);
  const [showHazardsPanel, setShowHazardsPanel] = useState(false);
  const [showCollectPanel, setShowCollectPanel] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // Hazard layers state
  const [hazardLayers, setHazardLayers] = useState<HazardLayerConfig[]>([]);
  const [globalHazardOpacity, setGlobalHazardOpacity] = useState(0.5);
  const [showSafdzLayer, setShowSafdzLayer] = useState(false);
  const [safdzPanelLeft, setSafdzPanelLeft] = useState<string>('1rem'); // Default to left-4 (16px)

  // Calculate SAFDZ panel left position to align with header's content left edge
  useEffect(() => {
    const calculateSafdzPanelLeft = () => {
      if (isMobile) {
        setSafdzPanelLeft('0.5rem'); // left-2 (8px) for mobile
        return;
      }

      // If any side panel is open, header is fixed at left-4 (16px)
      if (showMapAnalytics || showCollectPanel || showHazardsPanel) {
        setSafdzPanelLeft('1rem'); // left-4 (16px)
        return;
      }

      // When header is centered, calculate its outer left edge
      const viewportWidth = window.innerWidth;
      const headerMaxWidth = 1280; // max-w-7xl
      const headerHorizontalMargin = 32; // 2rem for w-[calc(100%-2rem)]

      // Calculate effective header width
      const effectiveHeaderWidth = Math.min(viewportWidth - headerHorizontalMargin, headerMaxWidth);

      // Calculate left edge of header element (centered) - align with outer edge
      const headerElementLeft = (viewportWidth - effectiveHeaderWidth) / 2;

      setSafdzPanelLeft(`${headerElementLeft}px`);
    };

    // Initial calculation
    calculateSafdzPanelLeft();

    // Recalculate on window resize
    window.addEventListener('resize', calculateSafdzPanelLeft);

    // Cleanup
    return () => window.removeEventListener('resize', calculateSafdzPanelLeft);
  }, [isMobile, showMapAnalytics, showCollectPanel, showHazardsPanel]);

  // SAFDZ data is now loaded on-demand by the hazard layer system

  // Hide loading screen when basic map is ready (hazards load on-demand now)
  useEffect(() => {
    if (isMapReady) {
      setIsLoading(false);
    }
  }, [isMapReady]);

  // Memoize summary statistics
  const summaryStats = useMemo(() => ({
    totalAvailableLand: barangays.reduce((sum, b) => sum + b.availableLand, 0),
    totalActiveDemands: barangays.reduce((sum, b) => sum + b.activeDemands, 0)
  }), [barangays]);

  const { totalAvailableLand, totalActiveDemands } = summaryStats;

  const handleSelectBarangay = useCallback((barangay: Barangay) => {
    setSelectedBarangay(barangay);
  }, []);


  // Hazard layer handlers
  const handleHazardLayerToggle = useCallback((layerId: string) => {
    setHazardLayers(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? { ...layer, enabled: !layer.enabled }
          : layer
      )
    );
  }, []);

  const handleHazardCategoryToggle = useCallback((layerId: string, categoryId: string) => {
    setHazardLayers(prev =>
      prev.map(layer =>
        layer.id === layerId && layer.categories
          ? {
              ...layer,
              categories: layer.categories.map(cat =>
                cat.id === categoryId
                  ? { ...cat, enabled: !cat.enabled }
                  : cat
              )
            }
          : layer
      )
    );
  }, []);

  const handleHazardOpacityChange = useCallback((layerId: string, opacity: number) => {
    setHazardLayers(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? { ...layer, opacity }
          : layer
      )
    );
  }, []);


  return (
    <div className="min-h-screen relative">
      {/* Loading Screen */}
      <LoadingScreen isLoading={isLoading} />
      {/* Fullscreen Agricultural Map */}
      <AgriculturalMapView3D
        barangays={barangays}
        selectedCrop={selectedCrop}
        onSelectBarangay={handleSelectBarangay}
        currentFilters={safdzFilters}
        hazardLayers={hazardLayers}
        onHazardLayersChange={setHazardLayers}
        globalHazardOpacity={globalHazardOpacity}
        aiResults={aiResults}
        onMapReady={setIsMapReady}
        showSafdzLayer={showSafdzLayer}
        showMapAnalytics={showMapAnalytics}
        showHazardsPanel={showHazardsPanel}
        showCollectPanel={showCollectPanel}
      />

      {/* Ekistia Header */}
      <EkistiaHeader
        safdzFilters={safdzFilters}
        onSafdzFiltersChange={setSafdzFilters}
        showSafdzFilters={showSafdzFilters}
        toggleSafdzFilters={() => setShowSafdzFilters(!showSafdzFilters)}
        showMapAnalytics={showMapAnalytics}
        toggleMapAnalytics={() => {
          setShowMapAnalytics(!showMapAnalytics);
          if (!showMapAnalytics) {
            setShowHazardsPanel(false);
            setShowCollectPanel(false);
          }
        }}
        showHazardsPanel={showHazardsPanel}
        toggleHazardsPanel={() => {
          setShowHazardsPanel(!showHazardsPanel);
          if (!showHazardsPanel) {
            setShowMapAnalytics(false);
            setShowCollectPanel(false);
          }
        }}
        onCollectClick={() => {
          setShowCollectPanel(true);
          setShowMapAnalytics(false);
          setShowHazardsPanel(false);
        }}
        showCollectPanel={showCollectPanel}
        onAIResultsGenerated={setAiResults}
      />

      {/* Floating SAFDZ Layer Toggle - Positioned under header's left side */}
      <div 
        className={`fixed ${isMobile ? 'top-[150px] left-2 right-2 max-h-[calc(100vh-250px)] overflow-y-auto' : 'top-[88px]'} z-[400] bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-2 md:p-3 ${isMobile ? 'max-w-full' : 'max-w-[280px]'} transition-all duration-300`}
        style={!isMobile ? { left: safdzPanelLeft } : undefined}
      >
        <label className="flex items-center gap-2 md:gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={showSafdzLayer}
            onChange={(e) => {
              const isEnabled = e.target.checked;
              setShowSafdzLayer(isEnabled);
              // When enabling, reset to show only Strategic CCP
              if (isEnabled) {
                setSafdzFilters(prev => ({
                  ...prev,
                  safdzZoneTypes: {
                    '1': true,   // Strategic CCP - enabled
                    '2': false, '3': false, '4': false, '5': false, '6': false,
                    '7': false, '8': false, '9': false, '10': false, 'BU': false, 'WB': false
                  }
                }));
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 flex-shrink-0"
          />
          <div className="text-xs text-muted-foreground">
            Strategic Agriculture & Fisheries Development Zones
          </div>
        </label>
        
        {/* SAFDZ Zone Types Checklist */}
        {showSafdzLayer && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="text-xs font-medium text-foreground mb-2">Zone Types</div>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {[
                  { code: '1', label: 'Strategic CCP' },
                  { code: '2', label: 'Strategic Livestock' },
                  { code: '3', label: 'Strategic Fishery' },
                  { code: '4', label: 'Integrated Crop/Livestock' },
                  { code: '5', label: 'Integrated Crop/Fishery' },
                  { code: '6', label: 'Integrated Crop/Livestock/Fishery' },
                  { code: '7', label: 'Integrated Fishery/Livestock' },
                  { code: '8', label: 'NIPAS' },
                  { code: '9', label: 'Rangelands/PAAD' },
                  { code: '10', label: 'Sub-watershed/Forestry' },
                  { code: 'BU', label: 'Built-Up Areas' },
                  { code: 'WB', label: 'Water Bodies' }
                ].map(({ code, label }) => {
                  const classification = SAFDZ_CLASSIFICATIONS[code];
                  const isEnabled = safdzFilters.safdzZoneTypes?.[code] ?? true;
                  
                  return (
                    <div key={code} className="flex items-center gap-2 text-xs">
                      <Checkbox
                        id={`safdz-panel-${code}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => {
                          setSafdzFilters(prev => ({
                            ...prev,
                            safdzZoneTypes: {
                              ...prev.safdzZoneTypes!,
                              [code]: checked as boolean
                            }
                          }));
                        }}
                        className="w-3 h-3"
                      />
                      <div 
                        className="w-3 h-3 rounded flex-shrink-0" 
                        style={{ backgroundColor: classification?.color || '#94a3b8' }}
                      />
                      <Label 
                        htmlFor={`safdz-panel-${code}`} 
                        className="cursor-pointer flex-1 text-xs"
                      >
                        {label}
                      </Label>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Map Analytics Dashboard */}
      {showMapAnalytics && (
        <MapAnalyticsDashboard
          barangays={barangays}
          onClose={() => setShowMapAnalytics(false)}
        />
      )}

      {/* Hazards Panel */}
      {showHazardsPanel && (
        <HazardPanel
          hazardLayers={hazardLayers}
          onLayerToggle={handleHazardLayerToggle}
          onCategoryToggle={handleHazardCategoryToggle}
          onOpacityChange={handleHazardOpacityChange}
          globalOpacity={globalHazardOpacity}
          onGlobalOpacityChange={setGlobalHazardOpacity}
          onClose={() => setShowHazardsPanel(false)}
        />
      )}

      {/* Collect Data Panel */}
      {showCollectPanel && (
        <CollectDataPanel
          onClose={() => setShowCollectPanel(false)}
        />
      )}

      {/* Selected Barangay Details Panel */}
      {selectedBarangay && (
        <div className={`fixed ${isMobile ? 'bottom-4 left-2 right-2 top-auto z-30 max-h-[calc(100vh-8rem)]' : `top-24 ${showHazardsPanel || showMapAnalytics || showCollectPanel ? 'right-[420px]' : 'right-4'} z-30 w-96 max-h-[calc(100vh-120px)]`} overflow-auto bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border transition-all duration-300 ease-in-out`}>
          <BarangayDetails
            barangay={selectedBarangay}
            selectedCrop={selectedCrop}
            onClose={() => setSelectedBarangay(null)}
          />
        </div>
      )}

      {/* AI Results Panel */}
      {aiResults && !selectedBarangay && (
        <div className={`fixed ${isMobile ? 'bottom-4 left-2 right-2 top-auto z-30 max-h-[calc(100vh-8rem)]' : `bottom-6 ${showHazardsPanel || showMapAnalytics || showCollectPanel ? 'left-6 right-[420px]' : 'left-6'} z-30 w-96 max-h-[calc(100vh-8rem)]`} bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out overflow-auto`}>
          <div className="p-3 md:p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-gray-900">AI Results</h3>
              </div>
              <button
                onClick={() => setAiResults(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div><span className="font-medium text-gray-900">{aiResults.foundAreas}</span> areas found</div>
              <div className="text-xs text-gray-500">Showing top {aiResults.topLocations.length} matches on map</div>
            </div>

            <div className="space-y-2">
              {aiResults.topLocations.map((location: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-900 text-white rounded-full text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{location.name}</div>
                    <div className="text-xs text-gray-500">{location.area} • {location.score}% match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
});

EkistiaIndex.displayName = 'EkistiaIndex';

export default EkistiaIndex;