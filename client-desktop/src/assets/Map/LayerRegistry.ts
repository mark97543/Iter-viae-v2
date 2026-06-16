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
    // --- BASE LAYERS (Land & Water) ---
    { id: 'water', type: 'fill', color: '#A0D2F1', minzoom: 0, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'waterway', type: 'line', color: '#7FB3D5', minzoom: 3, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'landcover', type: 'fill', color: '#EBEAE4', minzoom: 5, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'landuse', type: 'fill', color: '#D4E2D4', minzoom: 5, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'park', type: 'fill', color: '#D0E1D1', minzoom: 4, maxzoom: HIGH_RES_ZOOM, enabled: true },

    // --- INFRASTRUCTURE ---
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
    { id: 'building', type: 'fill', color: '#D4D4D4', minzoom: 13, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'aeroway', type: 'line', color: '#BDBDBD', minzoom: 10, maxzoom: HIGH_RES_ZOOM, enabled: false },

    // --- ADMINISTRATIVE & POINTS ---
    { id: 'boundary', type: 'line', color: '#999999', minzoom: 0, maxzoom: HIGH_RES_ZOOM, enabled: false },
    { 
        id: 'poi-fuel', 
        type: 'symbol', 
        color: '#757575', 
        minzoom: 6, 
        maxzoom: HIGH_RES_ZOOM, 
        enabled: true, 
        iconKey:'fuel',
        filter: ['==', ['get', 'subclass'], 'fuel'],
        showText:false,
    },
    { id: 'mountain_peak', type: 'symbol', color: '#566573', minzoom: 7, maxzoom: HIGH_RES_ZOOM, enabled: false },
    { id: 'aerodrome_label', type: 'symbol', color: '#000000', minzoom: 10, maxzoom: HIGH_RES_ZOOM, enabled: false },

    // --- LABELS (Symbols) ---
    { id: 'place', type: 'symbol', color: '#333333', minzoom: 2, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'transportation_name', type: 'symbol', color: '#5D6D7E', minzoom: 8, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'water_name', type: 'symbol', color: '#2E86C1', minzoom: 8, maxzoom: HIGH_RES_ZOOM, enabled: true },
    { id: 'housenumber', type: 'symbol', color: '#7F8C8D', minzoom: 14, maxzoom: HIGH_RES_ZOOM, enabled: false }
];

