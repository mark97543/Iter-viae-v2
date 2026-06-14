import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LAYER_REGISTRY } from './LayerRegistry';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

function TacticalMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [mapFiles, setMapFiles] = useState<string[]>([]);

    // Fetch maps with event-driven refresh
    useEffect(() => {
        const fetchMaps = async () => {
            try {
                const files = await invoke<string[]>('get_local_maps');
                console.log("TacticalMap updated mapFiles list:", files);
                setMapFiles(files);
            } catch (err) {
                console.error("Failed to load map list:", err);
            }
        };

        // Initial load
        fetchMaps();

        // Listen for the event globally
        const unlisten = listen('map-downloaded', () => {
            console.log("TacticalMap heard 'map-downloaded'! Refreshing...");
            fetchMaps();
        });

        // Cleanup on unmount
        return () => {
            unlisten.then((f) => f());
        };
    }, []);

    useEffect(() => {
        if (!mapContainer.current || mapFiles.length === 0) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: { 
                version: 8, 
                sources: {}, 
                layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#F2F0E9' } }] 
            },
            center: [-114.0, 44.0],
            zoom: 6,
            minZoom: 0,  
            maxZoom: 15.9  
        });

        map.on('load', () => {
            mapFiles.forEach(file => {
                const sourceId = file.replace('.mbtiles', '');

                map.addSource(sourceId, {
                    type: 'vector',
                    tiles: [`http://localhost:8080/tiles/${sourceId}/{z}/{x}/{y}`],
                    minzoom: 0,
                    maxzoom: 24 
                });

                LAYER_REGISTRY.forEach((layer) => {
                    if (!layer.enabled) return;
                    
                    const base = { 
                        id: `${sourceId}-${layer.id}-layer`, 
                        source: sourceId, 
                        'source-layer': layer.id, 
                        minzoom: layer.minzoom, 
                        maxzoom: layer.maxzoom 
                    };

                    if (layer.type === 'fill') {
                        map.addLayer({ 
                            ...base, 
                            type: 'fill', 
                            paint: { 'fill-color': layer.color, 'fill-opacity': 0.8 } 
                        } as any);
                    } else if (layer.type === 'line') {
                        // 1. Build the base configuration
                        const layerConfig: any = { 
                            ...base, 
                            type: 'line', 
                            paint: { 'line-color': layer.color, 'line-width': layer.id === 'boundary' ? 1.5 : 2.0 },
                            layout: layer.id === 'boundary' ? { 'line-dasharray': [2, 2] } : {}
                        };
                        
                        // 2. Only attach the filter if it explicitly exists
                        if (layer.filter) {
                            layerConfig.filter = layer.filter;
                        }
                        
                        map.addLayer(layerConfig);

                    } else if (layer.type === 'symbol') {
                        map.addLayer({ 
                            ...base, 
                            type: 'symbol', 
                            layout: { 
                                'text-field': ['get', 'name'], 
                                'text-size': 12,
                                'text-font': ['Open Sans Regular'] 
                            }, 
                            paint: { 'text-color': layer.color } 
                        } as any);
                    }
                });
            });
        }); 

        return () => map.remove(); 
    }, [mapFiles]);

    return (
        <div className="relative w-full h-full bg-gray-900">
            <div ref={mapContainer} className='w-full h-full absolute inset-0 z-0' />
        </div>
    );
}

export default TacticalMap;

//TODO: Add uSer Layers in Setting 
