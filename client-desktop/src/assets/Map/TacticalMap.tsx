import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useLocalMaps} from './Hooks/useLoaclMaps';
import {useMapLayers} from './Hooks/useMapLayers';
import { useLayerToggles } from './Hooks/useLayerToggles';
import LayerControlMenu from './Menus/LayerControlMenu';

function TacticalMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapFiles = useLocalMaps();
    const { layerVisibility, toggleLayer } = useLayerToggles();

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

        map.on('load', () => {
            useMapLayers(map, mapFiles, layerVisibility); 
        });

        //Temp Debug Code
        map.on('click', (e) => {
            // Query all layers that match 'transportation' in their ID
            const features = map.queryRenderedFeatures(e.point, {
                filter: ['all'], // You can remove this or keep it simple
            });

            // Filter the results to only those that have 'transportation' in their layer ID
            const transportFeatures = features.filter(f => f.layer.id.includes('transportation'));

            if (transportFeatures.length > 0) {
                console.log("Feature Data:", transportFeatures[0].properties);
            }
        });

        return () => map.remove(); 
    }, [mapFiles]);


    return (
        <div className="relative w-full h-full bg-gray-900">
            {/* Adding the key forces React to re-mount the div entirely */}
            <div 
                key={mapFiles.join(',')} 
                ref={mapContainer} 
                className='w-full h-full absolute inset-0 z-0' 
            />

            <LayerControlMenu/>
        </div>
    );
}

export default TacticalMap;

//TODO: Add uSer Layers in Setting 
