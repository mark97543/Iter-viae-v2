import { Waypoint, WAYPOINT_CONFIG } from "../../types/waypoints";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

interface WaypointLayerProps {
    map: maplibregl.Map;
    waypoints: Waypoint[];
    onWaypointMove?: (id: string, newLngLat: { lng: number, lat: number }) => void;
}

export const WaypointLayer = ({ map, waypoints, onWaypointMove }: WaypointLayerProps) => {
    const onWaypointMoveRef = useRef(onWaypointMove);
    const waypointsRef = useRef(waypoints);

    // Track dragging state
    const dragState = useRef<{ isDragging: boolean; waypointId: string | null }>({
        isDragging: false,
        waypointId: null
    });

    useEffect(() => {
        onWaypointMoveRef.current = onWaypointMove;
        waypointsRef.current = waypoints;
    }, [onWaypointMove, waypoints]);

    // Initialize the WebGL layers and events
    useEffect(() => {
        if (!map) return;

        const SOURCE_ID = 'waypoint-source';
        const CIRCLE_LAYER_ID = 'waypoint-circle-layer';
        const LABEL_LAYER_ID = 'waypoint-label-layer';

        // Event handlers
        const onMouseDown = (e: any) => {
            e.preventDefault();
            const features = map.queryRenderedFeatures(e.point, { layers: [CIRCLE_LAYER_ID] });
            if (features.length > 0) {
                const id = features[0].properties?.id;
                dragState.current = { isDragging: true, waypointId: id };
                map.getCanvas().style.cursor = 'grabbing';
                map.dragPan.disable(); // Stop map panning while dragging marker
            }
        };

        const onMouseMoveMap = (e: any) => {
            if (!dragState.current.isDragging || !dragState.current.waypointId) return;

            const updatedFeatures = waypointsRef.current.map(wp => {
                if (wp.id === dragState.current.waypointId) {
                    return {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] },
                        properties: { id: wp.id, name: wp.name, type: wp.type }
                    };
                }
                return {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [wp.coord.lng, wp.coord.lat] },
                    properties: { id: wp.id, name: wp.name, type: wp.type }
                };
            });

            const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
            if (source) {
                source.setData({
                    type: 'FeatureCollection',
                    features: updatedFeatures as any
                });
            }
        };

        const onMouseUpMap = (e: any) => {
            if (dragState.current.isDragging && dragState.current.waypointId) {
                const id = dragState.current.waypointId;
                const lng = e.lngLat.lng;
                const lat = e.lngLat.lat;

                dragState.current = { isDragging: false, waypointId: null };
                map.getCanvas().style.cursor = '';
                map.dragPan.enable();

                if (onWaypointMoveRef.current) {
                    onWaypointMoveRef.current(id, { lng, lat });
                }
            }
        };

        const onMouseEnter = () => {
            if (!dragState.current.isDragging) {
                map.getCanvas().style.cursor = 'grab';
            }
        };

        const onMouseLeave = () => {
            if (!dragState.current.isDragging) {
                map.getCanvas().style.cursor = '';
            }
        };

        const updateSourceData = (currentWaypoints: Waypoint[]) => {
            const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
            if (source) {
                source.setData({
                    type: 'FeatureCollection',
                    features: currentWaypoints.map(wp => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [wp.coord.lng, wp.coord.lat] },
                        properties: { id: wp.id, name: wp.name }
                    }))
                });
            }
        };

        const initLayers = () => {
            if (!map.getSource(SOURCE_ID)) {
                map.addSource(SOURCE_ID, {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                Object.values(WAYPOINT_CONFIG).forEach(config => {
                    // Use a unique ID that includes the color in case different types share the same pin image
                    const imageId = `${config.pin}-${config.color}`;
                    
                    if (!map.hasImage(imageId)) {
                        fetch(`/assets/${config.pin}`)
                            .then(res => res.text())
                            .then(svgText => {
                                // Replace currentColor with the waypoint color
                                const coloredSvg = svgText.replace(/currentColor/g, config.color);
                                const blob = new Blob([coloredSvg], { type: 'image/svg+xml' });
                                const url = URL.createObjectURL(blob);
                                
                                const img = new Image();
                                img.onload = () => {
                                    if (!map.hasImage(imageId)) {
                                        map.addImage(imageId, img);
                                    }
                                    URL.revokeObjectURL(url);
                                };
                                img.onerror = (err) => console.error('Failed to load image', config.pin, err);
                                img.src = url;
                            })
                            .catch(err => console.error('Failed to fetch SVG', config.pin, err));
                    }
                });

                map.addLayer({
                    id: CIRCLE_LAYER_ID,
                    type: 'symbol',
                    source: SOURCE_ID,
                    layout: {
                        'icon-image': [
                            'match',
                            ['get', 'type'],
                            'START', `${WAYPOINT_CONFIG.START.pin}-${WAYPOINT_CONFIG.START.color}`,
                            'FINISH', `${WAYPOINT_CONFIG.FINISH.pin}-${WAYPOINT_CONFIG.FINISH.color}`,
                            'FUEL', `${WAYPOINT_CONFIG.FUEL.pin}-${WAYPOINT_CONFIG.FUEL.color}`,
                            'LODGING', `${WAYPOINT_CONFIG.LODGING.pin}-${WAYPOINT_CONFIG.LODGING.color}`,
                            'SHAPE', `${WAYPOINT_CONFIG.SHAPE.pin}-${WAYPOINT_CONFIG.SHAPE.color}`,
                            'ATTRACTION', `${WAYPOINT_CONFIG.ATTRACTION.pin}-${WAYPOINT_CONFIG.ATTRACTION.color}`,
                            'FOOD', `${WAYPOINT_CONFIG.FOOD.pin}-${WAYPOINT_CONFIG.FOOD.color}`,
                            `${WAYPOINT_CONFIG.WAYPOINT.pin}-${WAYPOINT_CONFIG.WAYPOINT.color}` // Fallback default
                        ],
                        'icon-size': 1.15,
                        'icon-allow-overlap': true
                    }
                });

                map.addLayer({
                    id: LABEL_LAYER_ID,
                    type: 'symbol',
                    source: SOURCE_ID,
                    layout: {
                        'text-field': ['get', 'name'],
                        'text-size': 11,
                        'text-offset': [0, 1.2],
                        'text-anchor': 'top'
                    },
                    paint: {
                        'text-color': '#FFFFFF',
                        'text-halo-color': '#0A0A0A',
                        'text-halo-width': 1.5
                    }
                });

                // Attach events
                map.on('mousedown', CIRCLE_LAYER_ID, onMouseDown);
                map.on('mousemove', onMouseMoveMap);
                map.on('mouseup', onMouseUpMap);
                map.on('mouseenter', CIRCLE_LAYER_ID, onMouseEnter);
                map.on('mouseleave', CIRCLE_LAYER_ID, onMouseLeave);

                // Immediately populate data if waypoints exist
                updateSourceData(waypointsRef.current);
            }
        };

        // Check if map is fully loaded (sometimes map.loaded() is false during strict mode initialization)
        // map.isStyleLoaded() is often a safer check for adding sources
        if (map.isStyleLoaded()) {
            initLayers();
        } else {
            map.once('load', initLayers);
        }

        // Cleanup
        return () => {
            map.off('mousedown', CIRCLE_LAYER_ID, onMouseDown);
            map.off('mousemove', onMouseMoveMap);
            map.off('mouseup', onMouseUpMap);
            map.off('mouseenter', CIRCLE_LAYER_ID, onMouseEnter);
            map.off('mouseleave', CIRCLE_LAYER_ID, onMouseLeave);

            try {
                if (map.getLayer(CIRCLE_LAYER_ID)) map.removeLayer(CIRCLE_LAYER_ID);
                if (map.getLayer(LABEL_LAYER_ID)) map.removeLayer(LABEL_LAYER_ID);
                if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
            } catch (e) { }
        };
    }, [map]);

    // Update GeoJSON when waypoints change externally (unless we are actively dragging)
    useEffect(() => {
        if (!map || dragState.current.isDragging) return;

        const SOURCE_ID = 'waypoint-source';
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: waypoints.map(wp => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [wp.coord.lng, wp.coord.lat] },
                    properties: { id: wp.id, name: wp.name, type: wp.type }
                }))
            });
        }
    }, [waypoints, map]);

    return null; // Side-effect component, renders nothing in React DOM
};