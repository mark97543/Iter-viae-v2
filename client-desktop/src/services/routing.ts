/**
 * routing.ts
 * @file This file is strictly for talking to your Rust backend. 
 * @description It handles the mapping of your application types to the backend's expected input.
 */

import { invoke } from "@tauri-apps/api/core";
import { decodePolyline6 } from "../utils/polyline";
import { Waypoint } from "../Navigation/navigation.types";

export const RoutingService = {
    /**
     * Calculates a route between a series of waypoints
     */
    async calculateRoute(waypoints: Waypoint[]) {
        const locations = waypoints.map(wp => ({
            lat: wp.coord.lat,
            lng: wp.coord.lng
        }));

        try {
            const response: any = await invoke('calculate_route', { locations });

            // Normalize the response from Valhalla/Tauri
            let combinedCoordinates: any[] = [];
            response.trip.legs.forEach((leg: any) => {
                combinedCoordinates.push(...decodePolyline6(leg.shape));
            });

            return {
                routeShape: combinedCoordinates,
                stats: {
                    distance: response.trip.summary.length,
                    duration: response.trip.summary.time
                }
            };
        } catch (error) {
            console.error("RoutingService failed:", error);
            throw error; // Let the hook handle the UI notification
        }
    }
};