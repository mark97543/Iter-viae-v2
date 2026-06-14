import maplibregl from 'maplibre-gl';
import { LAYER_REGISTRY, ICON_REGISTRY } from '../LayerRegistry';

//Loads the Icons
const loadIcons = async (map: maplibregl.Map) => {
    for (const [key, config] of Object.entries(ICON_REGISTRY)) {
        if (!map.hasImage(config.id)) {
            const image = await map.loadImage(config.path);
            map.addImage(config.id, image.data);
        }
    }
};

export const useMapLayers = (map: maplibregl.Map, mapFiles: string[]) => {
    if (!map.loaded()) return;
    loadIcons(map);
   
    mapFiles.forEach(file => {
        const sourceId = file.replace('.mbtiles', '');

        // Add Source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'vector',
                tiles: [`http://localhost:8080/tiles/${sourceId}/{z}/{x}/{y}`],
                minzoom: 0,
                maxzoom: 16
            });
        }

        // Add Layers
        LAYER_REGISTRY.forEach((layer) => {
            if (!layer.enabled) return;
            const layerId = `${sourceId}-${layer.id}-layer`;
            if (map.getLayer(layerId)) return;

            const base: any = { 
                id: layerId, source: sourceId, 'source-layer': layer.id.split('-')[0], // Extract 'poi' from 'poi-fuel'
                minzoom: layer.minzoom, maxzoom: layer.maxzoom 
            };

            if (layer.type === 'fill') {
                map.addLayer({ ...base, type: 'fill', paint: { 'fill-color': layer.color } });
            } else if (layer.type === 'line') {
                const layerConfig: any = { 
                    ...base, 
                    type: 'line', 
                    paint: { 
                        'line-color': layer.color,
                        'line-width': [
                            'match',
                            ['get', 'class'],
                            'motorway', 4.0,   // Increased from 3.0
                            'primary', 3.5,    // Increased from 2.5
                            'secondary', 3.0,  // Increased from 2.0
                            'tertiary', 2.5,   // Increased from 1.5
                            'minor', 2.0,      // Increased from 1.0
                            'residential', 2.0,// Increased from 1.0
                            'service', 1.5,    // Increased from 0.8
                            2.0                // Default width
                        ]
                    },
                    layout: { 'line-join': 'round', 'line-cap': 'round' }
                };
                if (layer.filter) layerConfig.filter = layer.filter;
                map.addLayer(layerConfig);
            } else if (layer.type === 'symbol') {
                const symbolConfig: any = { 
                    ...base, 
                    type: 'symbol', 
                    layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'text-offset': [0, 1.5], 'text-anchor': 'top' },
                    paint: { 'text-color': layer.color } 
                };

                // Add icon logic if present
                if (layer.iconKey) {
                    const icon = ICON_REGISTRY[layer.iconKey];
                    symbolConfig.layout['icon-image'] = icon.id;
                    symbolConfig.layout['icon-size'] = 0.8;
                    symbolConfig.paint['icon-color'] = icon.color;
                    symbolConfig.paint['icon-halo-color'] = icon.halo;
                    symbolConfig.paint['icon-halo-width'] = 2;
                }

                if (layer.filter) symbolConfig.filter = layer.filter;
                map.addLayer(symbolConfig);
            }
        });
    });
};