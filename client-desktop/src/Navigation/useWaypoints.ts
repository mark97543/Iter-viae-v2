import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { decodePolyline6 } from '../utils/polyline';
import { Waypoint } from './navigation.types'; // Your frontend type

// 1. Define exactly what Rust wants so TypeScript stops complaining
interface RustLocation {
    lat: number;
    lng: number;
}

export function useWaypoints() {
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [routeShape, setRouteShape] = useState<any[]>([]);

    useEffect(() => {
        let ignore = false;

        const fetchRoute = async () => {
            if (waypoints.length < 2) {
                setRouteShape([]);
                return;
            }

            try {
                // 2. Explicitly type this array as RustLocation[]
                const locations: RustLocation[] = waypoints.map(wp => ({
                    lat: wp.coord.lat,
                    lng: wp.coord.lng
                }));

                const response: any = await invoke('calculate_route', { locations });
                if (ignore) return; // Discard stale responses

                console.log("Fetched new route!", locations, response);

                if (response?.trip?.legs) {
                    let combinedCoordinates: any[] = [];
                    
                    response.trip.legs.forEach((leg: any, i: number) => {
                        // Add the exact coordinate of the waypoint starting this leg
                        if (i < waypoints.length) {
                            combinedCoordinates.push([waypoints[i].coord.lng, waypoints[i].coord.lat]);
                        }

                        const decoded = decodePolyline6(leg.shape);
                        // Safely filter out any corrupted coordinates (NaN/null) that MapLibre would crash on
                        const validPoints = decoded.filter((pt: any) => 
                            Array.isArray(pt) && pt.length === 2 && 
                            Number.isFinite(pt[0]) && Number.isFinite(pt[1])
                        );
                        combinedCoordinates.push(...validPoints);

                        // If this is the final leg, add the exact coordinate of the final destination waypoint
                        if (i === response.trip.legs.length - 1 && i + 1 < waypoints.length) {
                            combinedCoordinates.push([waypoints[i + 1].coord.lng, waypoints[i + 1].coord.lat]);
                        }
                    });

                    // MapLibre WebGL crashes on Safari if two adjacent coordinates are exactly identical
                    // (or identical when truncated to Float32) because dividing by zero distance results in NaN angles.
                    const deduplicated = combinedCoordinates.filter((pt, i, arr) => {
                        if (i === 0) return true;
                        const prev = arr[i - 1];
                        // Filter out points that are extremely close (float32 collisions)
                        return Math.abs(pt[0] - prev[0]) > 0.000001 || Math.abs(pt[1] - prev[1]) > 0.000001;
                    });
                    
                    console.log("Setting new routeShape with length:", deduplicated.length);
                    setRouteShape(deduplicated);
                } else {
                    console.error("No route found or invalid response, falling back to straight lines:", response);
                    const straightLineShape = waypoints.map(wp => [wp.coord.lng, wp.coord.lat]);
                    setRouteShape(straightLineShape);
                }

            } catch (error) {
                if (!ignore) {
                    console.error("Routing failed (Valhalla couldn't find a path), falling back to straight lines:", error);
                    // Fallback to straight lines connecting the waypoints
                    const straightLineShape = waypoints.map(wp => [wp.coord.lng, wp.coord.lat]);
                    setRouteShape(straightLineShape);
                }
            }
        };

        fetchRoute();

        return () => {
            ignore = true;
        };
    }, [waypoints]);

    const addWaypoint = (poi: any) => {
        // Ensure you are adding items that match the navigation.types Waypoint shape
        setWaypoints(prev => [...prev, { ...poi, id: poi.id || crypto.randomUUID() }]);
    };

    const moveWaypoint = (id: string, newLngLat: any) => {
        setWaypoints(prev => prev.map(wp => wp.id === id ? { ...wp, coord: newLngLat } : wp));
    };

    return { waypoints, addWaypoint, moveWaypoint, setWaypoints, routeShape };
}