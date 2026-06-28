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
import { WaypointLayer } from '../../Navigation/WaypointLayer';
import { useTripContext } from '../../hooks/trip/TripContext';
import { useMapController } from '../../hooks/map/useMapController';

function TacticalMap() {
    const { mapContainer, map, isReady } = useMapController();
    const mapFiles = useLocalMaps();
    const { layerVisibility, toggleLayer } = useLayerToggles();
    const [clickedPoi, setClickedPoi] = useState<any | null>(null);
    const [addPoint, setAddPoint] = useState(false);
    const draftMarkerRef = useRef<maplibregl.Marker | null>(null);
    const { routeShape, addWaypoint, waypoints, moveWaypoint } = useTripContext();

    // Register Layers
    useEffect(() => {
        if (!map || !isReady) return;

        useMapLayers(
            map,
            mapFiles,
            layerVisibility,
            (poiProperties) => setClickedPoi(poiProperties)
        );

        map.triggerRepaint();
    }, [map, mapFiles, layerVisibility, isReady]);

    // Setup map event listeners
    useEffect(() => {
        if (!map) return;

        const onClick = (e: any) => {
            if (e.defaultPrevented) return;

            // Clear the Draft marker
            if (draftMarkerRef.current) {
                draftMarkerRef.current.remove();
                draftMarkerRef.current = null;
            }

            console.log('Empty Map Terrain clicked. Clearing Telemetry view State');
            setClickedPoi(null);
            setAddPoint(false); // Closes Add point
        };

        const onContextMenu = (e: any) => {
            e.preventDefault();
            setClickedPoi(null);
            const { lng, lat } = e.lngLat;

            // Clear old draft marker
            if (draftMarkerRef.current) {
                draftMarkerRef.current.remove();
            }

            draftMarkerRef.current = new maplibregl.Marker({
                color: '#D32F2F',
                draggable: true
            })
                .setLngLat([lng, lat])
                .addTo(map);
            setAddPoint(true); // Sets Point Marker on the stage

            console.log(`Waypoint placed at: ${lat}, ${lng}`);
        };

        map.on('click', onClick);
        map.on('contextmenu', onContextMenu);

        return () => {
            map.off('click', onClick);
            map.off('contextmenu', onContextMenu);
        };
    }, [map]);

    // Dynamically update layer visibilities when layerVisibility state changes
    useEffect(() => {
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
    }, [map, layerVisibility, mapFiles]);

    // Add Polyline between points
    useEffect(() => {
        if (!map) return;

        const SOURCE_ID = 'route-source';
        const LAYER_ID = 'route-line';

        // The data is already formatted and ready from useTrip()
        const geojsonData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: routeShape.length >= 2 ? [{
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: routeShape }
            }] : []
        };

        if (!map.getSource(SOURCE_ID)) {
            map.addSource(SOURCE_ID, { type: 'geojson', data: geojsonData });
            map.addLayer({
                id: LAYER_ID,
                type: 'line',
                source: SOURCE_ID,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#3b82f6', 'line-width': 4 }
            });
        } else {
            (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojsonData);
        }
    }, [map, routeShape]);

    return (
        <div className="relative w-full h-full bg-gray-900">
            {/* Adding the key forces React to re-mount the div entirely */}
            <div
                ref={mapContainer}
                className='w-full h-full absolute inset-0 z-0'
            />

            <LayerControlMenu layerVisibility={layerVisibility} toggleLayer={toggleLayer} />
            <LeftBar />
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
            <WaypointLayer
                map={map!}
                waypoints={waypoints}
                onWaypointMove={moveWaypoint}
            />

            <div className="absolute top-2 right-2 z-50 bg-black/80 text-white p-2 rounded text-xs">
                Debug: Route Points: {routeShape?.length || 0} | Waypoints: {waypoints?.length || 0}
            </div>
        </div>
    );
}

export default TacticalMap;

//TODO: Add uSer Layers in Setting 
//TODO: Add a center too search
