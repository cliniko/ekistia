import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
        <Button
          onClick={() => setIsExpanded(true)}
          variant="secondary"
          className="bg-card/95 backdrop-blur-sm shadow-lg flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">Hazards</span>
          {enabledCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {enabledCount}
            </span>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <Card className="bg-card/95 backdrop-blur-sm shadow-lg border w-96 max-h-[70vh] overflow-hidden flex flex-col">
          {/* Header */}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Hazard Layers</h3>
              </div>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Info Banner */}
          <div className="px-4 py-2 border-b">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-md p-3 text-xs text-orange-800 dark:text-orange-200">
              <Info className="w-4 h-4 inline mr-2" />
              Hazard data for flood zones, landslide risk, slope analysis, and land use patterns
            </div>
          </div>

          {/* Global Opacity Control */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-muted-foreground">Global Opacity</Label>
              <span className="text-xs font-mono text-foreground">{Math.round(globalOpacity * 100)}%</span>
            </div>
            <Slider
              value={[globalOpacity * 100]}
              onValueChange={(value) => onGlobalOpacityChange(value[0] / 100)}
              max={100}
              min={0}
              step={1}
              className="w-full"
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
                  <Card
                    key={layer.id}
                    className={`mb-2 transition-all ${
                      layer.enabled
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500/50'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {/* Toggle checkbox */}
                        <Checkbox
                          id={`layer-${layer.id}`}
                          checked={layer.enabled}
                          onCheckedChange={() => onLayerToggle(layer.id)}
                          className="mt-1"
                        />

                        <div className="flex-1 min-w-0">
                        {/* Layer header */}
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor={`layer-${layer.id}`} className="font-medium text-sm cursor-pointer">
                            {layer.name}
                          </Label>
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
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerExpansion(layer.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors h-auto p-1"
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
                          </Button>
                        )}

                        {/* Expanded categories */}
                        {layer.categories && expandedLayers.has(layer.id) && (
                          <div className="mt-2 space-y-1 pl-2 border-l-2 border-orange-200 dark:border-orange-800">
                            {layer.categories.map(category => (
                              <div
                                key={category.id}
                                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                <Checkbox
                                  id={`category-${layer.id}-${category.id}`}
                                  checked={category.enabled}
                                  onCheckedChange={() => onCategoryToggle(layer.id, category.id)}
                                  className="w-3 h-3"
                                />
                                <div
                                  className="w-3 h-3 rounded flex-shrink-0"
                                  style={{ backgroundColor: category.color }}
                                />
                                <Label htmlFor={`category-${layer.id}-${category.id}`} className="flex-1 cursor-pointer">
                                  {category.name}
                                </Label>
                                {category.count !== undefined && (
                                  <span className="text-muted-foreground">({category.count})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Individual opacity control (when layer is enabled) */}
                        {layer.enabled && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs text-muted-foreground">Opacity</Label>
                              <span className="text-xs font-mono">{Math.round(layer.opacity * 100)}%</span>
                            </div>
                            <Slider
                              value={[layer.opacity * 100]}
                              onValueChange={(value) => onOpacityChange(layer.id, value[0] / 100)}
                              max={100}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  <Button
                    onClick={() => hazardLayers.filter(l => l.enabled).forEach(l => onLayerToggle(l.id))}
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 hover:text-orange-700 h-auto p-1"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AgriculturalHazardLayerControl;

