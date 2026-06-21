// src/assets/Map/LayerRegistry.ts
export interface MapLayerConfig {
    id: string;
    type: 'fill' | 'line' | 'symbol';
    sourceLayer?:string;
    color: string;
    minzoom?: number;
    maxzoom?: number;
    enabled: boolean;
    filter?:any[];
    iconKey?:keyof typeof ICON_REGISTRY;
    showText?:boolean;
    textSize?:number | any;
    dasharray?:number[]; //[length, gap]
    width?:number;
}

//Icon Definitions
export const ICON_REGISTRY ={
    fuel: { 
        id: 'fuel-icon', 
        path: 'fuel.png', 
        icon_size: 0.25,
    },
}

export const LAYER_REGISTRY: MapLayerConfig[] = [
    // --- BASE LAYERS ---
    { id: 'water', sourceLayer: 'water', type: 'fill', color: '#0F1C2C', enabled: true },
    { id: 'waterway', sourceLayer: 'waterway', type: 'line', color: '#1A304A', enabled: true },
    { id: 'landcover', sourceLayer: 'landcover', type: 'fill', color: '#1C1C1E', enabled: false },
    { id: 'landuse', sourceLayer: 'landuse', type: 'fill', color: '#222224', enabled: false },
    { id: 'park', sourceLayer: 'park', type: 'fill', color: '#17281B', enabled: false },
    
    // --- INFRASTRUCTURE ---
    { 
        id: 'transportation', 
        sourceLayer: 'transportation', 
        type: 'line', 
        color: '#3C4A5A', 
        enabled: true,
        filter: ['all', ['!in', 'subclass', 'footway', 'path', 'track']] 
    },
    {
        id: 'boundary-state',
        sourceLayer: 'boundary',
        type: 'line',
        color: '#DC2626',
        enabled: true,
        width: 2.0,
        filter: ['==', ['get', 'admin_level'], 4]
    },
    {
        id: 'boundary-international',
        sourceLayer: 'boundary', // Ensure this matches your tile schema
        type: 'line',
        color: '#FAFAFA', // High-contrast white for national borders
        enabled: true,
        width: 2.0,
        filter: ['==', ['get', 'admin_level'], 2] // Level 2 = International
    },
    {
        id: 'fill-building',
        sourceLayer: 'building',
        type: 'fill',
        color: '#2D2D33',
        enabled: true
    },

    // --- LABELS (Add to LAYER_REGISTRY) ---
    {
        id: 'place-state',
        sourceLayer: 'place',
        type: 'symbol',
        color: '#E2E8F0', // Soft steel-white for state names
        minzoom: 3,
        maxzoom: 8,
        enabled: true,
        showText: true,
        textSize: [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 15,
            8, 20
        ],
        filter: ['==', ['get', 'class'], 'state']
    },
    {
        id: 'place-city',
        sourceLayer: 'place',
        type: 'symbol',
        color: '#CBD5E1', // Muted slate-grey for city names
        minzoom: 6,
        maxzoom: 13,
        enabled: true,
        showText: true,
        textSize: [
            'interpolate',
            ['linear'],
            ['zoom'],
            6, 10,
            13, 20
        ],
        filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'village']]]
    },
    
    // --- POINTS OF INTEREST ---
    { 
        id: 'poi-fuel', 
        sourceLayer: 'poi', 
        type: 'symbol', 
        color: '#E2E8F0', 
        enabled: false, 
        iconKey: 'fuel',
        filter: ['==', ['get', 'subclass'], 'fuel']
    }
];

