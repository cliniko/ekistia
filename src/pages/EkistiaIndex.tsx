import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import EkistiaHeader from '@/components/EkistiaHeader';
import AgriculturalMapView3D from '@/components/AgriculturalMapView3D';
import BarangayDetails from '@/components/BarangayDetails';
import MapAnalyticsDashboard from '@/components/MapAnalyticsDashboard';
import CollectDataPanel from '@/components/CollectDataPanel';
import HazardPanel from '@/components/HazardPanel';
import type { HazardLayerConfig } from '@/components/AgriculturalHazardLayerControl';
import { barangayData } from '@/data/barangayData';
import { Barangay, CropType } from '@/types/agricultural';
import { getSafdzData, getSafdzDataSync, isSafdzDataLoaded } from '@/services/safdzDataService';

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
  const [safdzData, setSafdzData] = useState<{ features: any[] } | null>(getSafdzDataSync());
  const [showMapAnalytics, setShowMapAnalytics] = useState(false);
  const [showHazardsPanel, setShowHazardsPanel] = useState(false);
  const [showCollectPanel, setShowCollectPanel] = useState(false);

  // Hazard layers state
  const [hazardLayers, setHazardLayers] = useState<HazardLayerConfig[]>([]);
  const [globalHazardOpacity, setGlobalHazardOpacity] = useState(0.5);

  // Load SAFDZ data using the pre-loader service
  useEffect(() => {
    // Check if data is already loaded synchronously
    if (isSafdzDataLoaded()) {
      const data = getSafdzDataSync();
      setSafdzData(data);
      return;
    }

    // Otherwise, wait for it to load
    getSafdzData()
      .then(data => {
        setSafdzData(data);
      })
      .catch(error => {
        console.error('❌ Failed to load SAFDZ data:', error);
      });
  }, []);

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


  // No longer blocking render while waiting for SAFDZ data
  // The map component will handle the loading state gracefully

  return (
    <div className="min-h-screen relative">
      {/* Fullscreen Agricultural Map */}
      <AgriculturalMapView3D
        barangays={barangays}
        selectedCrop={selectedCrop}
        onSelectBarangay={handleSelectBarangay}
        currentFilters={safdzFilters}
        safdzData={safdzData}
        hazardLayers={hazardLayers}
        onHazardLayersChange={setHazardLayers}
        globalHazardOpacity={globalHazardOpacity}
      />

      {/* Ekistia Header */}
      <EkistiaHeader
        safdzFilters={safdzFilters}
        onSafdzFiltersChange={setSafdzFilters}
        safdzData={safdzData}
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
      />

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
      

    </div>
  );
});

EkistiaIndex.displayName = 'EkistiaIndex';

export default EkistiaIndex;