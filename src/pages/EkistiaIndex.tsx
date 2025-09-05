import React, { useState } from 'react';
import { X } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import EkistiaHeader from '@/components/EkistiaHeader';
import AgriculturalMapView from '@/components/AgriculturalMapView';
import CropFilters from '@/components/CropFilters';
import BarangayDetails from '@/components/BarangayDetails';
import AgriculturalDataVisualization from '@/components/AgriculturalDataVisualization';
import DocumentManagement from '@/components/DocumentManagement';
import MarketplacePanel from '@/components/MarketplacePanel';
import { barangayData } from '@/data/barangayData';
import { sampleLandDemands, sampleLandOffers } from '@/data/sampleMarketplaceData';
import { Barangay, CropType, SuitabilityLevel } from '@/types/agricultural';

const EkistiaIndex = () => {
  const [barangays] = useState<Barangay[]>(barangayData);
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropType | 'all'>('all');
  const [suitabilityFilter, setSuitabilityFilter] = useState<SuitabilityLevel | 'all'>('all');
  const [activePanel, setActivePanel] = useState<'filters' | 'data' | 'documents' | 'marketplace' | null>(null);
  const isMobile = useIsMobile();

  const filteredBarangays = barangays.filter(barangay => {
    if (suitabilityFilter === 'all') return true;
    return barangay.suitabilityData.some(s => s.suitabilityLevel === suitabilityFilter);
  });

  const handleSelectBarangay = (barangay: Barangay) => {
    setSelectedBarangay(barangay);
  };

  const handleClearFilters = () => {
    setSelectedCrop('all');
    setSuitabilityFilter('all');
  };

  const togglePanel = (panel: 'filters' | 'data' | 'documents' | 'marketplace') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const totalAvailableLand = barangays.reduce((sum, b) => sum + b.availableLand, 0);
  const totalActiveDemands = barangays.reduce((sum, b) => sum + b.activeDemands, 0);

  return (
    <div className="min-h-screen relative">
      {/* Fullscreen Agricultural Map */}
      <AgriculturalMapView 
        barangays={filteredBarangays}
        selectedCrop={selectedCrop}
        onSelectBarangay={handleSelectBarangay}
      />
      
      {/* Ekistia Header */}
      <EkistiaHeader 
        activePanel={activePanel} 
        togglePanel={togglePanel}
        totalAvailableLand={totalAvailableLand}
        activeDemands={totalActiveDemands}
      />
      
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
      
      {/* Floating Panels */}
      {activePanel === 'filters' && (
        <div className={`fixed ${isMobile ? 'top-24 left-4 right-4' : 'top-24 left-4 w-96'} z-30 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-4`}>
          <button 
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
          <CropFilters 
            selectedCrop={selectedCrop}
            suitabilityFilter={suitabilityFilter}
            onCropChange={setSelectedCrop}
            onSuitabilityChange={setSuitabilityFilter}
            onClearFilters={handleClearFilters}
            totalBarangays={barangays.length}
            filteredCount={filteredBarangays.length}
          />
        </div>
      )}
      
      {activePanel === 'data' && (
        <div className={`fixed ${isMobile ? 'top-24 left-4 right-4' : 'top-24 left-4 w-[calc(100%-2rem)] max-w-6xl'} z-30 max-h-[calc(100vh-120px)] overflow-auto bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-4`}>
          <button 
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
          <AgriculturalDataVisualization barangays={barangays} />
        </div>
      )}
      
      {activePanel === 'marketplace' && (
        <div className={`fixed ${isMobile ? 'top-24 left-4 right-4' : 'top-24 left-4 w-[calc(100%-2rem)] max-w-6xl'} z-30 max-h-[calc(100vh-120px)] overflow-auto bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-4`}>
          <button 
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
          <MarketplacePanel 
            demands={sampleLandDemands}
            offers={sampleLandOffers}
            onCreateDemand={() => {}}
            onCreateOffer={() => {}}
          />
        </div>
      )}

      {activePanel === 'documents' && (
        <div className={`fixed ${isMobile ? 'top-24 left-4 right-4' : 'top-24 left-4 w-[calc(100%-2rem)] max-w-4xl'} z-30 max-h-[calc(100vh-120px)] overflow-auto bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border p-4`}>
          <button 
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
          <DocumentManagement />
        </div>
      )}
      
      {/* Footer */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-card/95 backdrop-blur-sm py-2 px-4 rounded-full shadow-md border">
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Ekistia Platform. Powered by Spatial Intelligence.
        </div>
      </div>
    </div>
  );
};

export default EkistiaIndex;