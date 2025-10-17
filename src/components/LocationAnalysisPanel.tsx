import React from 'react';
import { Barangay, CropType } from '@/types/agricultural';
import { MapPin, TrendingUp, X } from 'lucide-react';

interface LocationAnalysisPanelProps {
  barangay: Barangay | null;
  coordinates?: { lat: number; lng: number };
  onClose: () => void;
  onAddToDemands?: (barangay: Barangay) => void;
}

export const LocationAnalysisPanel: React.FC<LocationAnalysisPanelProps> = ({
  barangay,
  coordinates,
  onClose,
  onAddToDemands
}) => {
  if (!barangay && !coordinates) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const getSuitabilityLabel = (level: string): { text: string; color: string; bgColor: string } => {
    switch (level) {
      case 'highly-suitable':
        return { text: 'Highly Suitable', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' };
      case 'moderately-suitable':
        return { text: 'Moderately Suitable', color: 'text-yellow-700 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' };
      case 'low-suitable':
        return { text: 'Low Suitable', color: 'text-orange-700 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' };
      case 'not-suitable':
        return { text: 'Not Suitable', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' };
      default:
        return { text: 'Unknown', color: 'text-gray-700 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800' };
    }
  };

  const getCropIcon = (crop: CropType): string => {
    const icons: Record<CropType, string> = {
      rice: '🌾',
      corn: '🌽',
      coconut: '🥥',
      cacao: '🍫',
      banana: '🍌',
      mango: '🥭'
    };
    return icons[crop] || '🌱';
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[500] w-full max-w-2xl px-4">
      <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-primary/10">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Location Analysis</h3>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-muted rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {coordinates && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Coordinates</div>
              <div className="font-mono text-sm">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            </div>
          )}

          {barangay ? (
            <>
              {/* Barangay Info */}
              <div className="mb-4">
                <h4 className="text-lg font-bold mb-2">{barangay.name}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-muted-foreground">Total Area</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {formatNumber(barangay.totalArea)}
                    </div>
                    <div className="text-xs text-muted-foreground">hectares</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div className="text-xs text-muted-foreground">Agricultural Area</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-400">
                      {formatNumber(barangay.agriculturalArea)}
                    </div>
                    <div className="text-xs text-muted-foreground">hectares</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <div className="text-xs text-muted-foreground">Available Land</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                      {formatNumber(barangay.availableLand)}
                    </div>
                    <div className="text-xs text-muted-foreground">hectares</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                    <div className="text-xs text-muted-foreground">Active Demands</div>
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                      {barangay.activeDemands}
                    </div>
                    <div className="text-xs text-muted-foreground">requests</div>
                  </div>
                </div>

                {barangay.priorityZone && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                        LGU Priority Zone
                      </span>
                    </div>
                  </div>
                )}

                {barangay.matchedArea && barangay.matchedArea > 0 && (
                  <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="text-xs text-muted-foreground">Matched Area</div>
                    <div className="text-sm font-bold text-purple-700 dark:text-purple-400">
                      {formatNumber(barangay.matchedArea)} hectares
                    </div>
                    <div className="text-xs text-muted-foreground">
                      LGU priority + farmer supply + business demand overlap
                    </div>
                  </div>
                )}
              </div>

              {/* Crop Suitability */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3">Crop Suitability Analysis</h4>
                <div className="space-y-2">
                  {barangay.suitabilityData.length > 0 ? (
                    barangay.suitabilityData
                      .sort((a, b) => {
                        const order = { 'highly-suitable': 0, 'moderately-suitable': 1, 'low-suitable': 2, 'not-suitable': 3 };
                        return order[a.suitabilityLevel] - order[b.suitabilityLevel];
                      })
                      .map((suit, idx) => {
                        const suitabilityInfo = getSuitabilityLabel(suit.suitabilityLevel);
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${suitabilityInfo.bgColor}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCropIcon(suit.crop)}</span>
                                <span className="font-medium capitalize">{suit.crop}</span>
                              </div>
                              <span className={`text-xs font-medium ${suitabilityInfo.color}`}>
                                {suitabilityInfo.text}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Suitable Area</span>
                              <span className="text-sm font-bold">
                                {formatNumber(suit.suitableArea)} ha
                              </span>
                            </div>
                            <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                              <div
                                className={`h-full ${suit.suitabilityLevel === 'highly-suitable' ? 'bg-green-500' :
                                  suit.suitabilityLevel === 'moderately-suitable' ? 'bg-yellow-500' :
                                  suit.suitabilityLevel === 'low-suitable' ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                style={{
                                  width: `${(suit.suitableArea / barangay.agriculturalArea) * 100}%`
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round((suit.suitableArea / barangay.agriculturalArea) * 100)}% of agricultural area
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No crop suitability data available for this location
                    </div>
                  )}
                </div>
              </div>

              {/* AlphaEarth Enhancement Info */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Enhanced Analysis Available
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  Enable AlphaEarth satellite layers (top-right) to view real-time crop health,
                  soil moisture, water access, and investment priority zones for this area.
                </div>
              </div>

              {/* Actions */}
              {onAddToDemands && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAddToDemands(barangay)}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Add to Active Demands
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">
                No barangay data available for this location
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Click on a highlighted area to view detailed analysis
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationAnalysisPanel;
