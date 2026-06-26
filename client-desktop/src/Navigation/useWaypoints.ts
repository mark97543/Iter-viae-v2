import { useState } from "react";
import { Waypoint } from "./navigation.types";

export const useWaypoints = () => {
    const [waypoints, setWaypoints]=useState<Waypoint[]>([]);

    const addWaypoint = (poi:any)=>{
        const newWaypoint:Waypoint ={
            id:crypto.randomUUID(),
            name:poi.name || 'Waypoint',
            lng:poi.coord.lng,
            lat:poi.coord.lat
        };
        setWaypoints((prev)=>[...prev, newWaypoint]);
    }

    const moveWaypoint = (id: string, lng: number, lat: number) => {
        setWaypoints((prev) =>
            prev.map(wp => (wp.id === id ? { ...wp, lng, lat } : wp))
        );
    };

    const clearWaypoints = () =>setWaypoints([]);

    return {addWaypoint, moveWaypoint, waypoints, clearWaypoints, setWaypoints}
}

//TODO: Need Delete Waypoints 