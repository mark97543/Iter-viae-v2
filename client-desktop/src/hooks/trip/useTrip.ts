/**
 * useTrips.ts
 * @file This file contains the useTrip hook, which is used to manage the trip state.
 */

import { useState, useEffect } from "react";
import { RoutingService } from "../../services/routing";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export function useTrip() {
    const [waypoints, setWaypoints] = useState<any[]>([]);
    const [routeShape, setRouteShape] = useState<any[]>([]);
    const [stats, setStats] = useState({ distance: 0, duration: 0 });
    const [tripTitle, setTripTitle] = useState('');

    //Listener for the save trigger from the menu
    useEffect(() => {
        const unlisten = listen("trigger-save", async () => {
            // This code runs when the user clicks "Save Route" in the menu
            const dataToSave = JSON.stringify({
                title: tripTitle || "Untitled Trip",
                waypoints: waypoints
            });

            try {
                await invoke("save_route", {
                    routeName: tripTitle || "trip",
                    data: dataToSave
                });
                console.log("Trip saved successfully!");
            } catch (err) {
                console.error("Failed to save trip:", err);
            }
        });

        // Cleanup listener on unmount
        return () => {
            unlisten.then(f => f());
        };
    }, [waypoints, tripTitle]); // Re-run if these change

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
        moveWaypoint,
        tripTitle,
        setTripTitle
    };
}