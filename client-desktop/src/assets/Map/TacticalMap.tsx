import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useLocalMaps} from './Hooks/useLoaclMaps';
import {useMapLayers} from './Hooks/useMapLayers';
import { useLayerToggles } from './Hooks/useLayerToggles';
import LayerControlMenu from './Menus/LayerControlMenu';
import MenuCard from './Menus/MenuCard';
import LeftBar from './LeftBar';
import AddPoint from './Menus/AddPoint';

function TacticalMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapFiles = useLocalMaps();
    const { layerVisibility, toggleLayer } = useLayerToggles();
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [clickedPoi, setClickedPoi]=useState<any | null>(null);
    const [addPoint, setAddPoint]=useState(false);

    useEffect(() => {
        if (!mapContainer.current || mapFiles.length === 0) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0A0A0A' } }] },
            center: [-114.0, 44.0],
            zoom: 6,
            maxZoom:15.9, //Sets max zoom allowed by user. Too Far and this will make screen go blank
            attributionControl:false //KILL THE TEXT / INFO BUTTON
        });

        mapRef.current = map;
        let draftMarker: maplibregl.Marker | null = null; 

        map.on('load', () => {
            useMapLayers(
                map, 
                mapFiles, 
                layerVisibility,
                (poiProperties)=>setClickedPoi(poiProperties)
            ); 
        });

        //When Click remove POI menu data and draft marker
        map.on('click', (e)=>{
            if(e.defaultPrevented) return;

            //Clear the Draft marker
            if (draftMarker) {
                draftMarker.remove();
                draftMarker = null;
            }

            console.log('Empty Map Terrain clicked. Cleareing Telementry view State');
            setClickedPoi(null)
            setAddPoint(false) //Closes Add point 
        })

        //Create Waypoint markers
        map.on('contextmenu', (e)=>{
            e.preventDefault();
            setClickedPoi(null)
            const {lng,lat}=e.lngLat; //extract coordinates from the click event

            //Clear ofl draft marker
            if(draftMarker){
                draftMarker.remove();
            }

            draftMarker = new maplibregl.Marker({
                color: '#D32F2F',
                draggable:true
            })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map);
            setAddPoint(true); // Sets Point Marker on the stage

           console.log(`Waypoint placed at: ${lat}, ${lng}`);
        })

        return () => {
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


    return (
        <div className="relative w-full h-full bg-gray-900">
            {/* Adding the key forces React to re-mount the div entirely */}
            <div 
                key={mapFiles.join(',')} 
                ref={mapContainer} 
                className='w-full h-full absolute inset-0 z-0' 
            />

            <LayerControlMenu layerVisibility={layerVisibility} toggleLayer={toggleLayer}/>
            <LeftBar/>
            <MenuCard poi={clickedPoi}/>
            <AddPoint isOpen={addPoint}/>
        </div>
    );
}

export default TacticalMap;

//TODO: Add uSer Layers in Setting 
