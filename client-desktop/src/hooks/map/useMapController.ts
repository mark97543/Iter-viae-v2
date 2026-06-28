/**
 * useMapController.tsx
 * This hook will handle the map controller logic
 */

import { useEffect, useRef, useState } from "react";
import maplibregl from 'maplibre-gl';

export function useMapController() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [map, setMap] = useState<maplibregl.Map | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!mapContainer.current) return;

        //console.log("[useMapController] Initializing MapLibre instance...");
        const mapInstance = new maplibregl.Map({
            container: mapContainer.current,
            style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0A0A0A' } }] },
            center: [-114.0, 44.0],
            zoom: 6,
            maxZoom: 18,
            attributionControl: false,
        });

        mapInstance.once('styledata', () => {
            //console.log("[useMapController] MapLibre fired 'styledata'. Map is ready.");
            setMap(mapInstance);
            setIsReady(true);
        });

        mapInstance.once('load', () => {
            //console.log("[useMapController] MapLibre fired 'load'.");
        });
        mapRef.current = mapInstance;

        mapInstance.once('load', () => {
            setMap(mapInstance);
        });

        const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.resize();
            }
        });
        resizeObserver.observe(mapContainer.current);

        return () => {
            resizeObserver.disconnect();
            mapInstance.remove();
            mapRef.current = null;
            setMap(null);
        };
    }, []);

    return { mapRef, mapContainer, map, isReady };
}