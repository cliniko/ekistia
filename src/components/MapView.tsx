
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Pothole, HazardLayer } from '@/types';
import { getHazardStyleFunction, getHazardPopupContent } from '@/services/hazardDataService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  potholes: Pothole[];
  onSelectPothole: (pothole: Pothole) => void;
  hazardLayers?: HazardLayer[];
  enabledHazardLayers?: string[];
  hazardOpacity?: number;
}

export const MapView = ({
  potholes,
  onSelectPothole,
  hazardLayers = [],
  enabledHazardLayers = [],
  hazardOpacity = 0.7
}: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  const hazardLayerRefs = useRef<{[key: string]: L.GeoJSON}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Iligan City center coordinates
  const iliganCity = {
    lat: 8.228, 
    lng: 124.2452
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([iliganCity.lat, iliganCity.lng], 14);

    // Add OpenStreetMap tile layer (free to use)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Move zoom control to bottom right
    mapRef.current.zoomControl.remove();
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    // Add scale control to bottom left
    L.control.scale({ position: 'bottomleft' }).addTo(mapRef.current);

    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when potholes change
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for potholes
    potholes.forEach(pothole => {
      try {
        const severityColors = {
          'low': 'green',
          'medium': 'yellow',
          'high': 'orange',
          'critical': 'red'
        };

        const markerColor = severityColors[pothole.severity] || 'blue';
        
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${markerColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker(
          [pothole.location.lat, pothole.location.lng], 
          { icon: customIcon }
        ).addTo(mapRef.current!);

        marker.on('click', () => {
          onSelectPothole(pothole);
          
          // Show a popup with basic severity information
          const pointCloudInfo = pothole.lidarData ? 
            `<strong>3D Data Available</strong><br>` +
            `Depth: ${pothole.lidarData.surface?.depth}cm<br>` +
            `Width: ${pothole.lidarData.surface?.width}cm<br>` 
            : 'No 3D data available';
            
          marker.bindPopup(
            `<div class="text-sm">
              <strong>Pothole #${pothole.id}</strong><br>
              Severity: <span class="font-bold">${pothole.severity.toUpperCase()}</span><br>
              ${pointCloudInfo}
            </div>`
          ).openPopup();
        });

        // Add tooltip
        marker.bindTooltip(`Pothole #${pothole.id} - ${pothole.severity.toUpperCase()}`);

        markersRef.current[pothole.id] = marker;
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });
  }, [potholes, isLoading, onSelectPothole]);

  // Update hazard layers when enabled layers or opacity changes
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    console.log(`🗺️ Updating hazard layers. Enabled: [${enabledHazardLayers.join(', ')}]`);

    // Clear existing hazard layers
    Object.values(hazardLayerRefs.current).forEach(layer => layer.remove());
    hazardLayerRefs.current = {};

    // Add enabled hazard layers
    enabledHazardLayers.forEach(layerId => {
      const hazardLayer = hazardLayers.find(layer => layer.id === layerId);
      if (!hazardLayer) {
        console.warn(`⚠️ Hazard layer ${layerId} not found`);
        return;
      }
      if (!hazardLayer.data) {
        console.warn(`⚠️ Hazard layer ${layerId} has no data`);
        return;
      }

      try {
        console.log(`📍 Adding ${layerId} layer with ${hazardLayer.data.features?.length || 0} features`);
        const geoJsonLayer = L.geoJSON(hazardLayer.data, {
          style: getHazardStyleFunction(hazardLayer.type, hazardOpacity),
          onEachFeature: (feature, layer) => {
            const popupContent = getHazardPopupContent(hazardLayer.type, feature.properties);
            layer.bindPopup(popupContent);

            // Add hover effects (check if layer has setStyle method)
            if ('setStyle' in layer && typeof (layer as any).setStyle === 'function') {
              layer.on('mouseover', () => {
                (layer as L.Path).setStyle({
                  weight: 3,
                  color: '#000',
                  fillOpacity: Math.min(hazardOpacity + 0.2, 1)
                });
              });

              layer.on('mouseout', () => {
                (layer as L.Path).setStyle(getHazardStyleFunction(hazardLayer.type, hazardOpacity)(feature));
              });
            }
          }
        }).addTo(mapRef.current!);

        hazardLayerRefs.current[layerId] = geoJsonLayer;
        console.log(`✅ Successfully added ${layerId} layer to map`);
        
        // Optionally fit bounds to show the layer
        if (Object.keys(hazardLayerRefs.current).length === 1) {
          try {
            const bounds = geoJsonLayer.getBounds();
            if (bounds.isValid()) {
              mapRef.current!.fitBounds(bounds, { padding: [50, 50] });
            }
          } catch (e) {
            console.warn('Could not fit bounds:', e);
          }
        }
      } catch (error) {
        console.error(`❌ Error adding hazard layer ${layerId}:`, error);
      }
    });
  }, [hazardLayers, enabledHazardLayers, hazardOpacity, isLoading]);

  // Update hazard layer opacity when it changes
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    Object.entries(hazardLayerRefs.current).forEach(([layerId, geoJsonLayer]) => {
      const hazardLayer = hazardLayers.find(layer => layer.id === layerId);
      if (!hazardLayer) return;

      geoJsonLayer.setStyle(getHazardStyleFunction(hazardLayer.type, hazardOpacity));
    });
  }, [hazardOpacity, hazardLayers, isLoading]);

  return (
    <div className="fixed inset-0 z-0">
      {mapError ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-screen">
          <h3 className="text-lg font-semibold text-red-500">Map Error</h3>
          <p className="text-sm text-gray-600 max-w-md text-center">
            {mapError}
          </p>
        </div>
      ) : (
        <div className="relative w-full h-full bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pothole-500"></div>
            </div>
          )}
          <div ref={mapContainerRef} className="absolute inset-0"></div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 right-20 bg-white p-3 rounded-md shadow-md z-[400] floating-panel max-w-xs max-h-[60vh] overflow-auto">
            {/* Pothole Severity Legend */}
            {potholes.length > 0 && (
              <div className="mb-3 pb-3 border-b">
                <div className="text-xs font-medium mb-2">Pothole Severity</div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Low</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs">High</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">Critical</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hazard Layers Legend */}
            {enabledHazardLayers.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-2">Active Hazard Layers</div>
                <div className="space-y-2">
                  {enabledHazardLayers.map(layerId => {
                    const layer = hazardLayers.find(l => l.id === layerId);
                    if (!layer) return null;

                    // Flood hazard legend
                    if (layer.type === 'flood') {
                      return (
                        <div key={layerId} className="space-y-1">
                          <div className="text-xs font-semibold text-blue-700">Flood Risk</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                            <span className="text-xs">Low (LF)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                            <span className="text-xs">Medium (MF)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                            <span className="text-xs">High (HF)</span>
                          </div>
                        </div>
                      );
                    }

                    // Landslide hazard legend
                    if (layer.type === 'landslide') {
                      return (
                        <div key={layerId} className="space-y-1">
                          <div className="text-xs font-semibold text-amber-700">Landslide Risk</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                            <span className="text-xs">Low (L)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                            <span className="text-xs">Medium (M)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                            <span className="text-xs">High (H)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7f1d1d' }}></div>
                            <span className="text-xs">Very High (VH)</span>
                          </div>
                        </div>
                      );
                    }

                    // Slope hazard legend
                    if (layer.type === 'slope') {
                      return (
                        <div key={layerId} className="space-y-1">
                          <div className="text-xs font-semibold text-orange-700">Slope Classification</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                            <span className="text-xs">Flat (0-5°)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#84cc16' }}></div>
                            <span className="text-xs">Gentle (5-15°)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
                            <span className="text-xs">Moderate (15-30°)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
                            <span className="text-xs">Steep (30-45°)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                            <span className="text-xs">Very Steep (&gt;45°)</span>
                          </div>
                        </div>
                      );
                    }

                    // Land use legend
                    if (layer.type === 'landuse') {
                      return (
                        <div key={layerId} className="space-y-1">
                          <div className="text-xs font-semibold text-gray-700">Land Use</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6b7280' }}></div>
                            <span className="text-xs">Various Classifications</span>
                          </div>
                        </div>
                      );
                    }

                    // Ancestral domain legend
                    if (layer.type === 'ancestral_domain') {
                      return (
                        <div key={layerId} className="space-y-1">
                          <div className="text-xs font-semibold text-purple-700">Ancestral Domain</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                            <span className="text-xs">Protected Areas</span>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {potholes.length === 0 && enabledHazardLayers.length === 0 && (
              <div className="text-xs text-gray-500 text-center">
                No layers active
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
