import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useLocalMaps} from './Hooks/useLoaclMaps';
import {useMapLayers} from './Hooks/useMapLayers';
import { useLayerToggles } from './Hooks/useLayerToggles';
import LayerControlMenu from './Menus/LayerControlMenu';
import MenuCard from './Menus/MenuCard';

function TacticalMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapFiles = useLocalMaps();
    const { layerVisibility, toggleLayer } = useLayerToggles();
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [clickedPoi, setClickedPoi]=useState<any | null>(null);

    useEffect(() => {
        if (!mapContainer.current || mapFiles.length === 0) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#F2F0E9' } }] },
            center: [-114.0, 44.0],
            zoom: 6,
            maxZoom:15.9, //Sets max zoom allowed by user. Too Far and this will make screen go blank
            attributionControl:false //KILL THE TEXT / INFO BUTTON
        });

        mapRef.current = map;

        map.on('load', () => {
            useMapLayers(
                map, 
                mapFiles, 
                layerVisibility,
                (poiProperties)=>setClickedPoi(poiProperties)
            ); 
        });

        //When Click remove POI menu data
        map.on('click', (e)=>{
            if(e.defaultPrevented) return;

            console.log('Empty Map Terrain clicked. Cleareing Telementry view State');
            setClickedPoi(null)
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
            <MenuCard poi={clickedPoi}/>
        </div>
    );
}

export default TacticalMap;

//TODO: Add uSer Layers in Setting 
