
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Pothole } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  potholes: Pothole[];
  onSelectPothole: (pothole: Pothole) => void;
}

export const MapView = ({ potholes, onSelectPothole }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
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
          <div className="absolute bottom-4 right-20 bg-white p-3 rounded-md shadow-md z-[400] floating-panel">
            <div className="text-xs font-medium mb-2">Severity</div>
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
        </div>
      )}
    </div>
  );
};

export default MapView;
