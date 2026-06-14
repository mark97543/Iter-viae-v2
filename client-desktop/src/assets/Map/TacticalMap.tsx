import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LAYER_REGISTRY } from './LayerRegistry';

function TacticalMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {},
                layers: [
                    {
                        id: 'background',
                        type: 'background',
                        paint: { 'background-color': '#F2F0E9' }
                    }
                ]
            },
            center: [-114.0, 44.0],
            zoom: 6,
            minZoom: 2,  // Set minimum allowed zoom
            maxZoom: 19  // The "Hard Wall": Users cannot zoom past this
        });

        map.on('load', () => {
            map.addSource('idaho-data', {
                type: 'vector',
                tiles: ['http://localhost:8080/tiles/idaho/{z}/{x}/{y}'],
                minzoom: 0,
                maxzoom: 15
            });

            LAYER_REGISTRY.forEach((layer) => {
                if (!layer.enabled) return;

                if (layer.type === 'fill') {
                    map.addLayer({
                        id: `${layer.id}-layer`,
                        type: 'fill',
                        source: 'idaho-data',
                        'source-layer': layer.id,
                        minzoom: layer.minzoom,
                        maxzoom: layer.maxzoom,
                        paint: { 'fill-color': layer.color, 'fill-opacity': 0.8 },
                    });
                } else if (layer.type === 'line') {
                    const paint = { 'line-color': layer.color, 'line-width': layer.id === 'boundary' ? 1.5 : 2.0 };
                    const layout: any = layer.id === 'boundary' ? { 'line-dasharray': [2, 2] } : {};                    
                    const filter = layer.filter || undefined;
                    map.addLayer({
                        id: `${layer.id}-layer`,
                        type: 'line',
                        source: 'idaho-data',
                        'source-layer': layer.id,
                        minzoom: layer.minzoom,
                        maxzoom: layer.maxzoom,
                        paint: paint as any,
                        filter: filter as maplibregl.FilterSpecification,
                        layout: layout
                    });
                } else if (layer.type === 'symbol') {
                    map.addLayer({
                        id: `${layer.id}-layer`,
                        type: 'symbol',
                        source: 'idaho-data',
                        'source-layer': layer.id,
                        minzoom: layer.minzoom,
                        maxzoom: layer.maxzoom,
                        layout: { 
                            'text-field': ['get', 'name'], 
                            'text-size': 12,
                            'text-font': ['Open Sans Regular'] 
                        },
                        paint: { 'text-color': layer.color }
                    });
                }
            });
        }); 

        map.on('zoom', () => {
            console.log("Current Zoom Level:", map.getZoom());
        });

        return () => map.remove();
    }, []);

    return (
        <div ref={mapContainer} className='w-full h-full absolute inset-0 z-0' />
    );
}

export default TacticalMap;

//TODO: Add uSer Layers in Setting 
//TODO: Refresh on map load. 