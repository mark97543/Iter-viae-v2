import { Waypoint } from "./navigation.types";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

interface WaypointLayerProps {
    map: maplibregl.Map;
    waypoints: Waypoint[];
    onWaypointMove?: (id: string, lng: number, lat: number) => void;
}

export const WaypointLayer = ({ map, waypoints, onWaypointMove }: WaypointLayerProps) => {
    // Reference to store active map markers indexed by waypoint ID
    const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});

    useEffect(() => {
        if (!map) return;

        const currentWaypointIds = new Set(waypoints.map(wp => wp.id));

        // 1. Remove markers for waypoints that have been deleted
        Object.keys(markersRef.current).forEach(id => {
            if (!currentWaypointIds.has(id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // 2. Add or update markers for current waypoints
        waypoints.forEach(wp => {
            let marker = markersRef.current[wp.id];

            if (!marker) {
                // Create custom DOM element for the tactical waypoint marker
                const el = document.createElement('div');
                el.className = 'custom-waypoint-marker';
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
                el.style.alignItems = 'center';
                el.style.cursor = 'grab';

                // Red circle dot
                const dot = document.createElement('div');
                dot.style.width = '12px';
                dot.style.height = '12px';
                dot.style.borderRadius = '50%';
                dot.style.backgroundColor = '#DC2626'; // Tactical Red
                dot.style.border = '2px solid #FFFFFF'; // High contrast outline
                dot.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
                el.appendChild(dot);

                // Monospace text label
                const label = document.createElement('div');
                label.innerText = wp.name;
                label.style.color = '#FFFFFF';
                label.style.fontSize = '11px';
                label.style.fontWeight = 'bold';
                label.style.fontFamily = 'monospace';
                label.style.marginTop = '4px';
                // Standard GIS halo text-shadow
                label.style.textShadow = '1px 1px 0 #0A0A0A, -1px -1px 0 #0A0A0A, 1px -1px 0 #0A0A0A, -1px 1px 0 #0A0A0A';
                label.style.whiteSpace = 'nowrap';
                el.appendChild(label);

                // Create the draggable Marker
                marker = new maplibregl.Marker({
                    element: el,
                    draggable: true,
                    offset: [0, 6] // Center offset
                })
                .setLngLat([wp.lng, wp.lat])
                .addTo(map);

                // Bind drag event to update state coordinates
                marker.on('dragend', () => {
                    const newLngLat = marker.getLngLat();
                    onWaypointMove?.(wp.id, newLngLat.lng, newLngLat.lat);
                });

                markersRef.current[wp.id] = marker;
            } else {
                // If coordinates changed externally, update marker position
                const currentLngLat = marker.getLngLat();
                if (Math.abs(currentLngLat.lng - wp.lng) > 1e-7 || Math.abs(currentLngLat.lat - wp.lat) > 1e-7) {
                    marker.setLngLat([wp.lng, wp.lat]);
                }
            }
        });

        // Cleanup: remove all markers when component unmounts
        return () => {
            Object.values(markersRef.current).forEach(marker => marker.remove());
            markersRef.current = {};
        };
    }, [waypoints, map, onWaypointMove]);

    return null; // Side-effect component, renders nothing in React DOM
};