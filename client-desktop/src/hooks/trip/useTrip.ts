import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { decodePolyline6 } from "../../utils/polyline";

export function useTrip() {
    const [waypoints, setWaypoints] = useState<any[]>([]);
    const [routeShape, setRouteShape] = useState<any[]>([]);
    const [stats, setStats] = useState({ distance: 0, duration: 0 });

    useEffect(() => {
        const calculateTrip = async () => {
            if (waypoints.length < 2) {
                setRouteShape([]);
                setStats({ distance: 0, duration: 0 });
                return;
            }
            try {
                const locations = waypoints.map(wp => ({ lat: wp.coord.lat, lng: wp.coord.lng }));
                const response: any = await invoke('calculate_route', { locations });
                let combined: any[] = [];
                response.trip.legs.forEach((leg: any) => combined.push(...decodePolyline6(leg.shape)));
                setRouteShape(combined);
                setStats({ distance: response.trip.summary.length, duration: response.trip.summary.time });
            } catch (e) { console.error(e); }
        };
        calculateTrip();
    }, [waypoints]);

    const addWaypoint = (poi: any) => {
        setWaypoints(prev => [...prev, { ...poi, id: crypto.randomUUID() }]);
    };

    const deleteWaypoint = (id: string) => {
        setWaypoints(prev => prev.filter(wp => wp.id !== id));
    };

    const moveWaypoint = (id: string, newCoords: { lat: number, lng: number }) => {
        setWaypoints(prev => prev.map(wp => wp.id === id ? { ...wp, coord: newCoords } : wp));
    };

    return {
        waypoints,
        setWaypoints,
        routeShape,
        stats,
        addWaypoint,
        deleteWaypoint,
        moveWaypoint
    };
}