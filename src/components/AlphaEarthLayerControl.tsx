import React, { useState } from 'react';
import { AlphaEarthLayer, alphaEarthLayers } from '@/services/earthEngineService';
import { Layers, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface AlphaEarthLayerControlProps {
  enabledLayers: string[];
  onLayerToggle: (layerId: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

export const AlphaEarthLayerControl: React.FC<AlphaEarthLayerControlProps> = ({
  enabledLayers,
  onLayerToggle,
  opacity,
  onOpacityChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  // Group layers by category
  const categories = [
    { id: 'all', name: 'All Layers', icon: '🌍' },
    { id: 'crops', name: 'Crop Analysis', icon: '🌾' },
    { id: 'vegetation', name: 'Vegetation', icon: '🌿' },
    { id: 'soil', name: 'Soil & Land', icon: '🏞️' },
    { id: 'water', name: 'Water Features', icon: '💧' },
    { id: 'general', name: 'General', icon: '📊' }
  ];

  const filteredLayers = selectedCategory === 'all'
    ? alphaEarthLayers
    : alphaEarthLayers.filter(layer => layer.category === selectedCategory);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      crops: '#4CAF50',
      vegetation: '#8BC34A',
      soil: '#8B4513',
      water: '#2196F3',
      general: '#9E9E9E'
    };
    return colors[category] || '#9E9E9E';
  };

  return (
    <div className="absolute top-4 right-4 z-[500]">
      {/* Compact Toggle Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border px-4 py-2 flex items-center gap-2 hover:bg-card transition-all"
        >
          <Layers className="w-4 h-4" />
          <span className="text-sm font-medium">AlphaEarth Layers</span>
          {enabledLayers.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
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
              <Layers className="w-5 h-5" />
              <h3 className="font-semibold">AlphaEarth Satellite Layers</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="hover:bg-muted rounded p-1 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Google Earth Engine's AlphaEarth provides 128-band satellite embeddings for advanced agricultural analysis
            </span>
          </div>

          {/* Category Filter */}
          <div className="px-4 py-3 border-b">
            <div className="text-xs font-medium text-muted-foreground mb-2">Filter by Category</div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground border-primary'
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
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${opacity * 100}%, #e5e7eb ${opacity * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Layer List */}
          <div className="overflow-y-auto flex-1">
            {filteredLayers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No layers in this category
              </div>
            ) : (
              <div className="p-2">
                {filteredLayers.map(layer => (
                  <div
                    key={layer.id}
                    className="relative mb-2"
                    onMouseEnter={() => setHoveredLayer(layer.id)}
                    onMouseLeave={() => setHoveredLayer(null)}
                  >
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        enabledLayers.includes(layer.id)
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-card hover:bg-muted border-border'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enabledLayers.includes(layer.id)}
                        onChange={() => onLayerToggle(layer.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{layer.name}</span>
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCategoryColor(layer.category) }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {layer.description}
                        </p>

                        {/* Band info */}
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          {layer.bands.map(band => (
                            <span
                              key={band}
                              className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono"
                            >
                              {band}
                            </span>
                          ))}
                        </div>

                        {/* Color palette preview */}
                        {hoveredLayer === layer.id && (
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Palette:</span>
                            <div className="flex-1 flex h-2 rounded overflow-hidden">
                              {layer.visualization.palette.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-muted/50">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{enabledLayers.length} layer{enabledLayers.length !== 1 ? 's' : ''} active</span>
                {enabledLayers.length > 0 && (
                  <button
                    onClick={() => enabledLayers.forEach(id => onLayerToggle(id))}
                    className="text-primary hover:underline"
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

export default AlphaEarthLayerControl;
