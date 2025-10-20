import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { HazardLayerConfig } from './AgriculturalHazardLayerControl';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
    <div className={`fixed z-[500] bg-card/95 backdrop-blur-sm border border-border shadow-xl ${
      isMobile
        ? 'top-0 left-0 right-0 bottom-0 w-full h-full'
        : 'top-0 right-0 w-96 h-screen border-l'
    }`}>
      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Hazard Layers</h3>
              {enabledCount > 0 && (
                <Badge variant="destructive">
                  {enabledCount}
                </Badge>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Info Banner */}
        <div className="px-4 py-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Visualize flood zones, landslide susceptibility, slope analysis, land use patterns, and ancestral domains with pixelated grid overlays following international hazard standards.
            </AlertDescription>
          </Alert>
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
              Loading hazard layers...
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {hazardLayers.map(layer => (
                <Card
                  key={layer.id}
                  className={`transition-all ${
                    layer.enabled
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500/50'
                      : 'hover:bg-muted'
                  }`}
                >
                  <CardContent className="p-3">
                    {/* Layer header */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`layer-${layer.id}`}
                        checked={layer.enabled}
                        onCheckedChange={() => onLayerToggle(layer.id)}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor={`layer-${layer.id}`} className="font-medium text-sm cursor-pointer">
                            {layer.name}
                          </Label>
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
                          <Button
                            onClick={() => toggleLayerExpansion(layer.id)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 h-auto p-1"
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
                          <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-orange-200 dark:border-orange-800">
                            {layer.categories.map(category => (
                              <div
                                key={category.id}
                                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1.5 rounded"
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
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs text-muted-foreground">Layer Opacity</Label>
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
        <div className="px-4 py-3 border-t bg-muted/30">
          <div className="text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">
                {enabledCount} hazard layer{enabledCount !== 1 ? 's' : ''} active
              </span>
              {enabledCount > 0 && (
                <Button
                  onClick={() => hazardLayers.filter(l => l.enabled).forEach(l => onLayerToggle(l.id))}
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium h-auto p-1"
                >
                  Clear all
                </Button>
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

