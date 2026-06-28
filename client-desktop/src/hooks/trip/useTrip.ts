/**
 * useTrips.ts
 * @file This file contains the useTrip hook, which is used to manage the trip state.
 */

import { useState, useEffect } from "react";
import { RoutingService } from "../../services/routing";

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
                const result = await RoutingService.calculateRoute(waypoints);
                setRouteShape(result.routeShape);
                setStats(result.stats);
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