import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
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

      {/* Floating SAFDZ Layer Toggle */}
      <div className="fixed top-[120px] left-4 z-[400] bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={showSafdzLayer}
            onChange={(e) => setShowSafdzLayer(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-green-600">🌱</span>
            <span className="text-sm font-medium text-foreground group-hover:text-green-600 transition-colors">
              SAFDZ Zones
            </span>
          </div>
        </label>
        <div className="text-xs text-muted-foreground mt-2 max-w-[200px]">
          Strategic Agriculture & Fisheries Development Zones
        </div>
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
        <div className={`fixed ${isMobile ? 'bottom-16 left-4 right-4 top-auto z-30' : 'top-24 right-4 z-30 w-96'} max-h-[calc(100vh-120px)] overflow-auto bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border transition-all duration-300 ease-in-out`}>
          <BarangayDetails
            barangay={selectedBarangay}
            selectedCrop={selectedCrop}
            onClose={() => setSelectedBarangay(null)}
          />
        </div>
      )}

      {/* AI Results Panel */}
      {aiResults && !selectedBarangay && (
        <div className={`fixed ${isMobile ? 'bottom-16 left-4 right-4 top-auto z-30' : 'bottom-6 left-6 z-30 w-96'} bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out`}>
          <div className="p-4">
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