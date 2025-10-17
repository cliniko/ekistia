import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Eye, EyeOff } from 'lucide-react';

export interface HazardLayerConfig {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  opacity: number;
  color: string;
  featureCount?: number;
  categories?: {
    id: string;
    name: string;
    color: string;
    count?: number;
    enabled: boolean;
  }[];
}

interface AgriculturalHazardLayerControlProps {
  hazardLayers: HazardLayerConfig[];
  onLayerToggle: (layerId: string) => void;
  onCategoryToggle: (layerId: string, categoryId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  globalOpacity: number;
  onGlobalOpacityChange: (opacity: number) => void;
}

export const AgriculturalHazardLayerControl: React.FC<AgriculturalHazardLayerControlProps> = ({
  hazardLayers,
  onLayerToggle,
  onCategoryToggle,
  onOpacityChange,
  globalOpacity,
  onGlobalOpacityChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div className="absolute top-[180px] right-4 z-[500]">
      {/* Compact Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border px-4 py-2 flex items-center gap-2 hover:bg-card transition-all"
        >
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">Hazards</span>
          {enabledCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {enabledCount}
            </span>
          )}
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border w-96 max-h-[70vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Hazard Layers</h3>
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
              Hazard data for flood zones, landslide risk, slope analysis, and land use patterns
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
                No hazard layers available
              </div>
            ) : (
              <div className="p-2">
                {hazardLayers.map(layer => (
                  <div
                    key={layer.id}
                    className="mb-2"
                  >
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        layer.enabled
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500/50'
                          : 'bg-card hover:bg-muted border-border'
                      }`}
                    >
                      {/* Toggle checkbox */}
                      <input
                        type="checkbox"
                        checked={layer.enabled}
                        onChange={() => onLayerToggle(layer.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        {/* Layer header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{layer.name}</span>
                          <span className="text-sm">{layer.icon}</span>
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: layer.color }}
                          />
                          {layer.featureCount !== undefined && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {layer.featureCount} zones
                            </span>
                          )}
                        </div>

                        {/* Categories toggle */}
                        {layer.categories && layer.categories.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerExpansion(layer.id);
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                          <div className="mt-2 space-y-1 pl-2 border-l-2 border-orange-200 dark:border-orange-800">
                            {layer.categories.map(category => (
                              <label
                                key={category.id}
                                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
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
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Opacity</span>
                              <span className="text-xs font-mono">{Math.round(layer.opacity * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={layer.opacity * 100}
                              onChange={(e) => {
                                e.stopPropagation();
                                onOpacityChange(layer.id, parseInt(e.target.value) / 100);
                              }}
                              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, ${layer.color} 0%, ${layer.color} ${layer.opacity * 100}%, #e5e7eb ${layer.opacity * 100}%, #e5e7eb 100%)`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-muted/50">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{enabledCount} hazard layer{enabledCount !== 1 ? 's' : ''} active</span>
                {enabledCount > 0 && (
                  <button
                    onClick={() => hazardLayers.filter(l => l.enabled).forEach(l => onLayerToggle(l.id))}
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

export default AgriculturalHazardLayerControl;

