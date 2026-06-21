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

export const useMapLayers = (
        map: maplibregl.Map, 
        mapFiles: string[], 
        layerVisibility:Record<string,boolean>,
        onPoiClick?:(properties:any)=>void
    ) => {
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
            const isVisible = layerVisibility[layer.id];
            const visibilityValue = isVisible ? 'visible' : 'none';

            const layerId = `${sourceId}-${layer.id}-layer`;

            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', visibilityValue);
                return; 
            }

            const sourceLayerName = layer.sourceLayer || layer.id.split('-').pop(); // .pop() takes the last part, usually more reliable
            //console.log(`[MAP DEBUG] Layer: ${layer.id} | Searching Source-Layer: ${sourceLayerName} | Layer ID: ${layerId}`);
            //console.log(`Debug Layer: ${layerId} | SourceLayer: ${sourceLayerName}`);
            const base: any = { 
                id: layerId, 
                source: sourceId, 
                'source-layer': sourceLayerName, 
                minzoom: layer.minzoom, 
                maxzoom: layer.maxzoom 
            };

            if (layer.type === 'fill') {
                const isBuilding = layer.id === 'fill-building';
                map.addLayer({ 
                    ...base, 
                    // 1. Correct the type here
                    type: isBuilding ? 'fill-extrusion' : 'fill', 
                    paint: isBuilding ? {
                        // 2. Extrusion properties are valid ONLY for type 'fill-extrusion'
                        'fill-extrusion-color': layer.color,
                        'fill-extrusion-height': ['get', 'render_height'],
                        'fill-extrusion-base': ['get', 'render_min_height'],
                        'fill-extrusion-opacity': 0.9
                    } : { 
                        // 3. Standard fill properties for non-building polygons
                        'fill-color': layer.color, 
                        'fill-opacity': 0.9 
                    },
                    layout: {
                        'visibility': visibilityValue
                    }
                });
            } else if (layer.type === 'line') {
                const layerConfig: any = { 
                    ...base, 
                    type: 'line', 
                    paint: { 
                        'line-color': layer.color,
                        // 1. Line Width: If a static width is defined, use it. Otherwise, use your road logic.
                        'line-width': layer.width || [
                            'match',
                            ['get', 'class'],
                            'motorway', 4.0,
                            'primary', 3.5,
                            2.0 // Default
                        ],
                        'line-dasharray': layer.dasharray || [1, 0]
                    },
                    layout: { 
                        'line-join': 'round', 
                        'line-cap': 'round',
                        'visibility': visibilityValue
                    }
                };
                if (layer.filter) layerConfig.filter = layer.filter;
                map.addLayer(layerConfig);
            }else if (layer.type === 'symbol') {
                const symbolConfig: any = { 
                    ...base, 
                    type: 'symbol', 
                    layout: {
                        'visibility': visibilityValue
                    },
                    paint: {}
                };

                //OPTIONAL TEXT LOGIC ---
                // Only build text properties if the registry says showText is true
                if (layer.showText) {
                    symbolConfig.layout['text-field'] = ['get', 'name'];
                    symbolConfig.layout['text-size'] = layer.textSize || 10;
                    symbolConfig.layout['text-offset'] = [0, 1.5];
                    symbolConfig.layout['text-anchor'] = 'top';
                    symbolConfig.paint['text-color'] = layer.color;
                    symbolConfig.paint['text-halo-color'] = '#0A0A0A'; // Matches map background
                    symbolConfig.paint['text-halo-width'] = 1.5;
                }

                // Add icon logic if present
                if (layer.iconKey) {
                    const icon = ICON_REGISTRY[layer.iconKey];
                    symbolConfig.layout['icon-image'] = icon.id;
                    symbolConfig.layout['icon-size'] = icon.icon_size;
                    symbolConfig.layout['icon-allow-overlap'] = true;
                    // Prevent other layers from moving out of the way for this icon
                    symbolConfig.layout['icon-ignore-placement'] = true;

                    // If text IS enabled for this icon, make the text optional
                    // so it doesn't drag the icon down with it during a collision
                    if (layer.showText) {
                        symbolConfig.layout['text-optional'] = true;
                    }
                }

                if (layer.filter) symbolConfig.filter = layer.filter;
                map.addLayer(symbolConfig);

                //Cursor for POI
                map.on('mouseenter',layerId, ()=>{
                    map.getCanvas().style.cursor = 'pointer'
                });

                map.on('mouseleave', layerId, () =>{
                    map.getCanvas().style.cursor ='';
                });

                //Click Menu on POI
                map.on('click',layerId, (e)=>{
                    if(e.features && e.features.length > 0){
                        const properties = e.features[0];
                        const feature = e.features[0];

                        const poiCoords = feature.geometry.type === 'Point' 
                            ? (feature.geometry as any).coordinates 
                            : [e.lngLat.lng, e.lngLat.lat]; // Fallback to click if not a point

                        //console.log("COORD IN: ", feature.geometry)
                        const dataPackage = {prop:properties,coord:{ lng: poiCoords[0], lat: poiCoords[1] }}
                        //send the clicked poi data back to the react component
                        onPoiClick?.(dataPackage);
                    }}
                )
            }
        });
    });
};


