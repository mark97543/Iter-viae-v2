/**
 * routing.ts
 * @file This file is strictly for talking to your Rust backend. 
 * @description It handles the mapping of your application types to the backend's expected input.
 */

import { invoke } from "@tauri-apps/api/core";
import { decodePolyline6 } from "../utils/polyline";
import { Waypoint } from "../types/navigation.types";

export const RoutingService = {
    /**
     * Calculates a route between a series of waypoints
     */
    async calculateRoute(waypoints: Waypoint[]) {
        const locations = waypoints.map(wp => ({
            lat: wp.coord.lat,
            lng: wp.coord.lng
        }));

        // Fallback to straight lines connecting the waypoints
        const straightLineShape = waypoints.map(wp => [wp.coord.lng, wp.coord.lat]);

        try {
            const response: any = await invoke('calculate_route', { locations });

            if (response && response.trip && response.trip.legs) {
                // Normalize the response from Valhalla/Tauri
                let combinedCoordinates: any[] = [];
                response.trip.legs.forEach((leg: any) => {
                    combinedCoordinates.push(...decodePolyline6(leg.shape));
                });
                
                // Deduplicate to prevent MapLibre WebGL crashes on identical points
                const deduplicated = combinedCoordinates.filter((pt, i, arr) => {
                    if (i === 0) return true;
                    const prev = arr[i - 1];
                    return Math.abs(pt[0] - prev[0]) > 0.000001 || Math.abs(pt[1] - prev[1]) > 0.000001;
                });

                return {
                    routeShape: deduplicated.length >= 2 ? deduplicated : straightLineShape,
                    stats: {
                        distance: response.trip.summary.length,
                        duration: response.trip.summary.time
                    }
                };
            } else {
                console.warn("Valhalla returned no valid route. Falling back to straight lines.", response);
                return {
                    routeShape: straightLineShape,
                    stats: { distance: 0, duration: 0 }
                };
            }
        } catch (error) {
            console.error("RoutingService failed. Falling back to straight lines.", error);
            return {
                routeShape: straightLineShape,
                stats: { distance: 0, duration: 0 }
            };
        }
    }
};