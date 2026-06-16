import { useState } from 'react';
import { LAYER_REGISTRY } from '../LayerRegistry';

export const useLayerToggles = () =>{
    const initialState = LAYER_REGISTRY.reduce((acc, layer)=>{
        acc[layer.id] = layer.enabled;
        return acc;
    },{} as Record<string, boolean>);

    const [layerVisibility, setLayerVisibility] = useState(initialState);

    //A simple function to flip the switch for any specific layer
    const toggleLayer = (layerId: string) => {
        setLayerVisibility(prev => ({
            ...prev,
            [layerId]: !prev[layerId]
        }));
    };

    return { layerVisibility, toggleLayer };
};