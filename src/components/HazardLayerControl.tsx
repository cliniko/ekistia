import React, { useState } from 'react';
import { HazardLayer, HazardLayerState } from '@/types';
import { hazardLayers, HAZARD_COLOR_SCHEMES } from '@/services/hazardDataService';
import { Layers, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';

interface HazardLayerControlProps {
  hazardLayers: HazardLayer[];
  enabledLayers: string[];
  onLayerToggle: (layerId: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

export const HazardLayerControl: React.FC<HazardLayerControlProps> = ({
  hazardLayers,
  enabledLayers,
  onLayerToggle,
  opacity,
  onOpacityChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  // Hazard categories
  const categories = [
    { id: 'all', name: 'All Hazards', icon: '⚠️' },
    { id: 'flood', name: 'Flood Risk', icon: '🌊' },
    { id: 'landslide', name: 'Landslides', icon: '🏔️' },
    { id: 'slope', name: 'Terrain', icon: '📐' },
    { id: 'landuse', name: 'Land Use', icon: '🏗️' },
    { id: 'ancestral', name: 'Ancestral', icon: '🏞️' }
  ];

  const filteredLayers = selectedCategory === 'all'
    ? hazardLayers
    : hazardLayers.filter(layer => {
        if (selectedCategory === 'flood') return layer.type === 'flood';
        if (selectedCategory === 'landslide') return layer.type === 'landslide';
        if (selectedCategory === 'slope') return layer.type === 'slope';
        if (selectedCategory === 'landuse') return layer.type === 'landuse';
        if (selectedCategory === 'ancestral') return layer.type === 'ancestral_domain';
        return true;
      });

  const getHazardTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      flood: '#dc2626',
      landslide: '#7f1d1d',
      slope: '#f59e0b',
      landuse: '#6b7280',
      ancestral_domain: '#8b5cf6'
    };
    return colors[type] || '#9E9E9E';
  };

  const getHazardIcon = (type: string): string => {
    const icons: Record<string, string> = {
      flood: '🌊',
      landslide: '🏔️',
      slope: '📐',
      landuse: '🏗️',
      ancestral_domain: '🏞️'
    };
    return icons[type] || '⚠️';
  };

  const getRiskLevelInfo = (layerId: string) => {
    switch (layerId) {
      case 'flood':
        return {
          levels: ['Low (LF)', 'Medium (MF)', 'High (HF)'],
          colors: ['#10b981', '#f59e0b', '#dc2626']
        };
      case 'landslide':
        return {
          levels: ['Low (L)', 'Medium (M)', 'High (H)', 'Very High (VH)'],
          colors: ['#10b981', '#f59e0b', '#dc2626', '#7f1d1d']
        };
      case 'slope':
        return {
          levels: ['Flat', 'Gentle', 'Moderate', 'Steep', 'Very Steep'],
          colors: ['#10b981', '#84cc16', '#eab308', '#f97316', '#dc2626']
        };
      default:
        return null;
    }
  };

  return (
    <div className="absolute top-20 right-4 z-[500]">
      {/* Compact Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border px-4 py-2 flex items-center gap-2 hover:bg-card transition-all"
        >
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">Hazard Layers</span>
          {enabledLayers.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {enabledLayers.length}
            </span>
          )}
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border w-96 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Hazard Risk Layers</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="hover:bg-muted rounded p-1 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b text-xs text-orange-800 dark:text-orange-200 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Hazard data for Iligan City including flood zones, landslide susceptibility, slope analysis, and land use patterns
            </span>
          </div>

          {/* Category Filter */}
          <div className="px-4 py-3 border-b">
            <div className="text-xs font-medium text-muted-foreground mb-2">Filter by Hazard Type</div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Control */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Layer Opacity</span>
              <span className="text-xs font-mono text-foreground">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity * 100}
              onChange={(e) => onOpacityChange(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${opacity * 100}%, #e5e7eb ${opacity * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Layer List */}
          <div className="overflow-y-auto flex-1">
            {filteredLayers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No hazard layers in this category
              </div>
            ) : (
              <div className="p-2">
                {filteredLayers.map(layer => {
                  const riskInfo = getRiskLevelInfo(layer.id);

                  return (
                    <div
                      key={layer.id}
                      className="relative mb-2"
                      onMouseEnter={() => setHoveredLayer(layer.id)}
                      onMouseLeave={() => setHoveredLayer(null)}
                    >
                      <label
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          enabledLayers.includes(layer.id)
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500/50'
                            : 'bg-card hover:bg-muted border-border'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enabledLayers.includes(layer.id)}
                          onChange={() => onLayerToggle(layer.id)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{layer.name}</span>
                            <span className="text-sm">{getHazardIcon(layer.type)}</span>
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getHazardTypeColor(layer.type) }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {layer.description}
                          </p>

                          {/* Feature count */}
                          <div className="mt-1 text-xs text-muted-foreground">
                            {layer.data?.features?.length || 0} features
                          </div>

                          {/* Risk level color palette */}
                          {riskInfo && hoveredLayer === layer.id && (
                            <div className="mt-2 flex items-center gap-1 flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Risk Levels:</span>
                              <div className="w-full space-y-1">
                                {riskInfo.levels.map((level, idx) => (
                                  <div key={level} className="flex items-center gap-2 text-xs">
                                    <div
                                      className="w-3 h-3 rounded flex-shrink-0"
                                      style={{ backgroundColor: riskInfo.colors[idx] }}
                                    />
                                    <span>{level}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-muted/50">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{enabledLayers.length} hazard layer{enabledLayers.length !== 1 ? 's' : ''} active</span>
                {enabledLayers.length > 0 && (
                  <button
                    onClick={() => enabledLayers.forEach(id => onLayerToggle(id))}
                    className="text-orange-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardLayerControl;
