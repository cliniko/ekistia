import React from 'react';
import { Barangay } from '@/types/agricultural';
import { MapPin, TrendingUp, Layers, Info, X } from 'lucide-react';

interface MapAnalyticsDashboardProps {
  barangays: Barangay[];
  isExpanded?: boolean;
  onClose?: () => void;
}

export const MapAnalyticsDashboard: React.FC<MapAnalyticsDashboardProps> = ({
  barangays,
  isExpanded: initialExpanded = false,
  onClose
}) => {

  // Calculate total statistics
  const totalAvailableLand = barangays.reduce((sum, b) => sum + b.availableLand, 0);
  const totalActiveDemands = barangays.reduce((sum, b) => sum + b.activeDemands, 0);
  const totalAgriculturalArea = barangays.reduce((sum, b) => sum + b.agriculturalArea, 0);
  const totalMatchedArea = barangays.reduce((sum, b) => sum + (b.matchedArea || 0), 0);
  const priorityZones = barangays.filter(b => b.priorityZone).length;

  // Get visible barangay names
  const visibleBarangays = barangays
    .sort((a, b) => b.agriculturalArea - a.agriculturalArea)
    .slice(0, 13)
    .map(b => b.name);

  // Crop distribution analysis
  const cropStats = barangays.reduce((acc, barangay) => {
    barangay.suitabilityData.forEach(suit => {
      if (!acc[suit.crop]) {
        acc[suit.crop] = {
          totalArea: 0,
          highlySuitable: 0,
          moderatelySuitable: 0,
          count: 0
        };
      }
      acc[suit.crop].totalArea += suit.suitableArea;
      acc[suit.crop].count += 1;

      if (suit.suitabilityLevel === 'highly-suitable') {
        acc[suit.crop].highlySuitable += suit.suitableArea;
      } else if (suit.suitabilityLevel === 'moderately-suitable') {
        acc[suit.crop].moderatelySuitable += suit.suitableArea;
      }
    });
    return acc;
  }, {} as Record<string, { totalArea: number; highlySuitable: number; moderatelySuitable: number; count: number }>);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  return (
    <div className="fixed top-0 right-0 z-[500] w-96 h-screen bg-card/95 backdrop-blur-sm border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out">
      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Current Map Analysis</h3>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="hover:bg-muted rounded p-1 transition-colors"
                aria-label="Close analytics panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Coverage Area */}
            <div className="p-4 border-b">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Coverage Area</div>
                  <div className="text-xs text-muted-foreground">
                    Iligan City and surrounding municipalities (Northern Mindanao)
                  </div>
                </div>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="p-4 border-b space-y-3">
              <div className="text-sm font-medium mb-3">Key Statistics</div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="text-xs text-muted-foreground">Available Land</div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-400">
                    {formatNumber(totalAvailableLand)}
                  </div>
                  <div className="text-xs text-muted-foreground">hectares</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-muted-foreground">Active Demands</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {totalActiveDemands}
                  </div>
                  <div className="text-xs text-muted-foreground">requests</div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="text-xs text-muted-foreground">Matched Area</div>
                  <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                    {formatNumber(totalMatchedArea)}
                  </div>
                  <div className="text-xs text-muted-foreground">hectares</div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                  <div className="text-xs text-muted-foreground">Priority Zones</div>
                  <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                    {priorityZones}
                  </div>
                  <div className="text-xs text-muted-foreground">barangays</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Total Agricultural Area</div>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(totalAgriculturalArea)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">ha</span>
                </div>
                <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(totalAvailableLand / totalAgriculturalArea) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round((totalAvailableLand / totalAgriculturalArea) * 100)}% available for development
                </div>
              </div>
            </div>

            {/* Crop Suitability Analysis */}
            <div className="p-4 border-b">
              <div className="text-sm font-medium mb-3">Crop Suitability Summary</div>
              <div className="space-y-2">
                {Object.entries(cropStats)
                  .sort((a, b) => b[1].highlySuitable - a[1].highlySuitable)
                  .map(([crop, stats]) => (
                    <div key={crop} className="bg-muted/30 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium capitalize">{crop}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(stats.highlySuitable)} ha highly suitable
                        </span>
                      </div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${(stats.highlySuitable / stats.totalArea) * 100}%`
                          }}
                          title="Highly Suitable"
                        />
                        <div
                          className="bg-yellow-500"
                          style={{
                            width: `${(stats.moderatelySuitable / stats.totalArea) * 100}%`
                          }}
                          title="Moderately Suitable"
                        />
                        <div
                          className="bg-gray-300"
                          style={{
                            width: `${((stats.totalArea - stats.highlySuitable - stats.moderatelySuitable) / stats.totalArea) * 100}%`
                          }}
                          title="Other"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.count} barangay{stats.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Visible Areas */}
            <div className="p-4 border-b">
              <div className="text-sm font-medium mb-2">Visible Areas</div>
              <div className="flex flex-wrap gap-1.5">
                {visibleBarangays.map((name, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-muted rounded-full border"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="p-4">
              <div className="text-sm font-medium mb-3">Key Features</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Green patches</span> = Agricultural/available land with high crop suitability
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Purple zones</span> = Matched areas (LGU priority + farmer supply + business demand)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Layers className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Terrain visualization</span> showing elevation and 3D topography
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Coastal areas</span> (west) - Iligan Bay waterfront
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Mountainous regions</span> (east) - suitable for high-value crops
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Urban center</span> - Iligan City proper with infrastructure
                  </div>
                </div>
              </div>
            </div>

            {/* AlphaEarth Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <div className="font-medium mb-1">Enhanced with AlphaEarth</div>
                  <div>
                    Enable satellite layers (top-right) to view crop-specific suitability analysis
                    using Google Earth Engine's 128-band embeddings for rice, corn, coconut,
                    high-value crops, and vegetables.
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default MapAnalyticsDashboard;
