// src/assets/Map/LayerRegistry.ts
export interface MapLayerConfig {
    id: string;
    type: 'fill' | 'line' | 'symbol';
    color: string;
    minzoom?: number;
    maxzoom?: number;
    enabled: boolean;
    filter?:any[];
    iconKey?:keyof typeof ICON_REGISTRY;
    showText?:boolean;
    dasharray?:number[]; //[length, gap]
    width?:number[];
}

//Icon Definitions
export const ICON_REGISTRY ={
    fuel: { 
        id: 'fuel-icon', 
        path: 'fuel.png', 
        icon_size: 0.25,
    },
}

const HIGH_RES_ZOOM = 20; 

export const LAYER_REGISTRY: MapLayerConfig[] = [
    { 
        id: 'transportation', 
        type: 'line', 
        color: '#5D6D7E', 
        minzoom: 4, 
        maxzoom: HIGH_RES_ZOOM, 
        enabled: true, 
        filter: [
            'all',
            ['!in', 'subclass', 'footway', 'path', 'track'], // Exclude paths/footways
            ['in', 'class', 'motorway', 'primary', 'secondary', 'tertiary', 'minor', 'service', 'residential', 'unclassified']
        ]
    },
    { 
        id: 'poi-fuel', 
        type: 'symbol', 
        color: '#757575', 
        minzoom: 6, 
        maxzoom: HIGH_RES_ZOOM, 
        enabled: false, 
        iconKey:'fuel',
        filter: ['==', ['get', 'subclass'], 'fuel'],
        showText:false,
    },
    {
        id:'boundary-state',
        type:'line',
        color:'#D32F2F', // Your tactical crimson
        enabled:true,
        filter:['==',['get','admin_level'],4]
    },
    {
        id:'building',
        type:'fill',
        color: '#D4D4D4', // Industrial grey for the tactical look
        minzoom:14,
        maxzoom:20,
        enabled:true
    },
];

