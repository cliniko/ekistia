import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import type { HazardLayerConfig } from './AgriculturalHazardLayerControl';

interface HazardPanelProps {
  hazardLayers: HazardLayerConfig[];
  onLayerToggle: (layerId: string) => void;
  onCategoryToggle: (layerId: string, categoryId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  globalOpacity: number;
  onGlobalOpacityChange: (opacity: number) => void;
  onClose: () => void;
}

export const HazardPanel: React.FC<HazardPanelProps> = ({
  hazardLayers,
  onLayerToggle,
  onCategoryToggle,
  onOpacityChange,
  globalOpacity,
  onGlobalOpacityChange,
  onClose
}) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const toggleLayerExpansion = (layerId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  const enabledCount = hazardLayers.filter(l => l.enabled).length;

  return (
    <div className="fixed top-0 right-0 z-[500] w-96 h-screen bg-card/95 backdrop-blur-sm border-l border-border shadow-xl">
      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">Hazard Layers</h3>
            {enabledCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {enabledCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="hover:bg-muted rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border-b text-xs text-orange-800 dark:text-orange-200 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Visualize flood zones, landslide susceptibility, slope analysis, land use patterns, and ancestral domains with pixelated grid overlays following international hazard standards.
          </span>
        </div>

        {/* Global Opacity Control */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Global Opacity</span>
            <span className="text-xs font-mono text-foreground">{Math.round(globalOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={globalOpacity * 100}
            onChange={(e) => onGlobalOpacityChange(parseInt(e.target.value) / 100)}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${globalOpacity * 100}%, #e5e7eb ${globalOpacity * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>

        {/* Layer List */}
        <div className="overflow-y-auto flex-1">
          {hazardLayers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Loading hazard layers...
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {hazardLayers.map(layer => (
                <div
                  key={layer.id}
                  className={`rounded-lg border transition-all ${
                    layer.enabled
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500/50'
                      : 'bg-card hover:bg-muted border-border'
                  }`}
                >
                  <div className="p-3">
                    {/* Layer header */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={layer.enabled}
                        onChange={() => onLayerToggle(layer.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{layer.name}</span>
                          <span className="text-base">{layer.icon}</span>
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: layer.color }}
                          />
                        </div>
                        
                        {layer.featureCount !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            {layer.featureCount.toLocaleString()} zones
                          </div>
                        )}

                        {/* Categories toggle */}
                        {layer.categories && layer.categories.length > 0 && (
                          <button
                            onClick={() => toggleLayerExpansion(layer.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                          >
                            {expandedLayers.has(layer.id) ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                Hide categories
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                Show {layer.categories.length} categories
                              </>
                            )}
                          </button>
                        )}

                        {/* Expanded categories */}
                        {layer.categories && expandedLayers.has(layer.id) && (
                          <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-orange-200 dark:border-orange-800">
                            {layer.categories.map(category => (
                              <label
                                key={category.id}
                                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1.5 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={category.enabled}
                                  onChange={() => onCategoryToggle(layer.id, category.id)}
                                  className="w-3 h-3 rounded border-gray-300"
                                  style={{ 
                                    accentColor: category.color
                                  }}
                                />
                                <div
                                  className="w-3 h-3 rounded flex-shrink-0"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="flex-1">{category.name}</span>
                                {category.count !== undefined && (
                                  <span className="text-muted-foreground">({category.count})</span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Individual opacity control (when layer is enabled) */}
                        {layer.enabled && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Layer Opacity</span>
                              <span className="text-xs font-mono">{Math.round(layer.opacity * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={layer.opacity * 100}
                              onChange={(e) => onOpacityChange(layer.id, parseInt(e.target.value) / 100)}
                              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, ${layer.color} 0%, ${layer.color} ${layer.opacity * 100}%, #e5e7eb ${layer.opacity * 100}%, #e5e7eb 100%)`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-muted/30">
          <div className="text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">
                {enabledCount} hazard layer{enabledCount !== 1 ? 's' : ''} active
              </span>
              {enabledCount > 0 && (
                <button
                  onClick={() => hazardLayers.filter(l => l.enabled).forEach(l => onLayerToggle(l.id))}
                  className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="text-muted-foreground text-xs pt-2 border-t border-border/50">
              Colors follow international hazard standards (ANSI Z535.1, ISO 3864-4)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HazardPanel;

