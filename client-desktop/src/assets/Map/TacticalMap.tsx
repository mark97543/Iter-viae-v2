import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLocalMaps } from './Hooks/useLoaclMaps';
import { useMapLayers } from './Hooks/useMapLayers';
import { useLayerToggles } from './Hooks/useLayerToggles';
import LayerControlMenu from './Menus/LayerControlMenu';
import MenuCard from './Menus/MenuCard';
import LeftBar from './LeftBar';
import AddPoint from './Menus/AddPoint';
import { useWaypoints } from '../../Navigation/useWaypoints';
import { WaypointLayer } from '../../Navigation/WaypointLayer';

function TacticalMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapFiles = useLocalMaps();
    const { layerVisibility, toggleLayer } = useLayerToggles();
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [clickedPoi, setClickedPoi] = useState<any | null>(null);
    const [addPoint, setAddPoint] = useState(false);
    const { waypoints, addWaypoint, moveWaypoint, setWaypoints, routeShape } = useWaypoints();
    const draftMarkerRef = useRef<maplibregl.Marker | null>(null);

    useEffect(() => {
        if (!mapContainer.current || mapFiles.length === 0) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0A0A0A' } }] },
            center: [-114.0, 44.0],
            zoom: 6,
            maxZoom: 18, // Limit zoom to prevent blank screens when overzooming offline tiles
            attributionControl: false //KILL THE TEXT / INFO BUTTON
        });

        mapRef.current = map;

        const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.resize();
            }
        });
        resizeObserver.observe(mapContainer.current);

        map.on('load', () => {
            useMapLayers(
                map,
                mapFiles,
                layerVisibility,
                (poiProperties) => setClickedPoi(poiProperties)
            );
        });

        //When Click remove POI menu data and draft marker
        map.on('click', (e) => {
            if (e.defaultPrevented) return;

            //Clear the Draft marker
            if (draftMarkerRef.current) {
                draftMarkerRef.current.remove();
                draftMarkerRef.current = null;
            }

            console.log('Empty Map Terrain clicked. Cleareing Telementry view State');
            setClickedPoi(null)
            setAddPoint(false) //Closes Add point 
        })

        //Create Waypoint markers
        map.on('contextmenu', (e) => {
            e.preventDefault();
            setClickedPoi(null)
            const { lng, lat } = e.lngLat; //extract coordinates from the click event

            //Clear ofl draft marker
            if (draftMarkerRef.current) {
                draftMarkerRef.current.remove();
            }

            draftMarkerRef.current = new maplibregl.Marker({
                color: '#D32F2F',
                draggable: true
            })
                .setLngLat([e.lngLat.lng, e.lngLat.lat])
                .addTo(map);
            setAddPoint(true); // Sets Point Marker on the stage

            console.log(`Waypoint placed at: ${lat}, ${lng}`);
        })

        return () => {
            resizeObserver.disconnect();
            map.remove();
            mapRef.current = null;
        };
    }, [mapFiles]);

    // Dynamically update layer visibilities when layerVisibility state changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.loaded()) return;

        mapFiles.forEach(file => {
            const sourceId = file.replace('.mbtiles', '');

            Object.entries(layerVisibility).forEach(([layerId, isVisible]) => {
                const mapLayerId = `${sourceId}-${layerId}-layer`;
                if (map.getLayer(mapLayerId)) {
                    map.setLayoutProperty(mapLayerId, 'visibility', isVisible ? 'visible' : 'none');
                }
            });
        });
    }, [layerVisibility, mapFiles]);

    //Add Polyline between points
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const SOURCE_ID = 'route-source';
        const LAYER_ID = 'route-line';

        const geojsonData: any = {
            type: 'FeatureCollection',
            features: routeShape && routeShape.length >= 2 ? [{
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: routeShape }
            }] : []
        };

        const updateRoute = () => {
            console.log("TacticalMap updateRoute running. routeShape length:", routeShape?.length);
            // Forcefully remove the old layer and source to completely bypass MapLibre WebGL caching bugs
            if (map.getLayer(LAYER_ID)) {
                console.log("Removing old LAYER_ID");
                map.removeLayer(LAYER_ID);
            }
            if (map.getSource(SOURCE_ID)) {
                console.log("Removing old SOURCE_ID");
                map.removeSource(SOURCE_ID);
            }

            // Only add back if there is a valid route to draw
            if (geojsonData.features.length > 0) {
                console.log("Adding new SOURCE and LAYER with points:", geojsonData.features[0].geometry.coordinates.length);
                map.addSource(SOURCE_ID, {
                    type: 'geojson',
                    data: geojsonData
                });

                map.addLayer({
                    id: LAYER_ID,
                    type: 'line',
                    source: SOURCE_ID,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#3b82f6', 'line-width': 4 }
                });
            } else {
                console.log("No features to draw, leaving map empty of route.");
            }
        };

        const tryUpdateRoute = () => {
            try {
                updateRoute();
            } catch (err: any) {
                // If MapLibre complains the style isn't ready, wait 50ms and try again
                // This bypasses the deadlock bugs in MapLibre's event system
                if (err.message && err.message.includes('Style is not done loading')) {
                    setTimeout(tryUpdateRoute, 50);
                } else {
                    console.error("Failed to update route:", err);
                }
            }
        };

        tryUpdateRoute();

    }, [routeShape])

    return (
        <div className="relative w-full h-full bg-gray-900">
            {/* Adding the key forces React to re-mount the div entirely */}
            <div
                key={mapFiles.join(',')}
                ref={mapContainer}
                className='w-full h-full absolute inset-0 z-0'
            />

            <LayerControlMenu layerVisibility={layerVisibility} toggleLayer={toggleLayer} />
            <LeftBar waypoints={waypoints} setWaypoints={setWaypoints} />
            <MenuCard
                poi={clickedPoi}
                onAddWaypoint={(poiData) => {
                    addWaypoint(poiData);
                    setClickedPoi(null); // Close the POI card
                }}
            />
            <AddPoint
                isOpen={addPoint}
                onConfirm={() => {
                    // Now typescript knows exactly what draftMarkerRef is
                    if (!draftMarkerRef.current) return;

                    const lngLat = draftMarkerRef.current.getLngLat();
                    const poiData = {
                        name: "New Waypoint",
                        coord: { lng: lngLat.lng, lat: lngLat.lat }
                    };

                    addWaypoint(poiData);

                    // Clean up the marker from the map
                    draftMarkerRef.current.remove();
                    draftMarkerRef.current = null;
                    setAddPoint(false);
                }}
            />
            <WaypointLayer map={mapRef.current!} waypoints={waypoints} onWaypointMove={moveWaypoint} />
            <div className="absolute top-2 right-2 z-50 bg-black/80 text-white p-2 rounded text-xs">
                Debug: Route Points: {routeShape?.length || 0} | Waypoints: {waypoints?.length || 0}
            </div>
        </div>
    );
}

export default TacticalMap;

//TODO: Add uSer Layers in Setting 
