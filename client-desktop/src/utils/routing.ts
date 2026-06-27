import { invoke } from '@tauri-apps/api/core';

interface Waypoint {
    lat: number;
    lng: number;
}

export const getMotorcycleRoute = async (locations: Waypoint[]) => {
    //Map points to valhalla format
    const waypoints = locations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
        type: 'break'
    }))

    const payload = {
        locations: waypoints,
        costing: "motorcycle",
        costing_options: {
            "motorcycle": {
                exclude_unpaved: 1.0, //No Dirt Lock
                use_hills: 0.5, //cruiser friendly hills
                surface_penalty: 1000.0 //Extra save for non-paved segments. 
            }
        },
        directions_options: { units: "miles" }
    }

    //to rust backend
    const response = await invoke('calculate_route', { locations });

    return await response;
}