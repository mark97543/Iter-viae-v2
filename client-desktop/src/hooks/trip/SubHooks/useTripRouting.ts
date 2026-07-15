// src/hooks/trip/SubHooks/useTripRouting.ts

/**
 * useTripRouting.ts
 * @file This hook is responsible for managing the routing logic of a trip. 
 * It handles the routing calculations and provides the results to the UI.
 */

import type { Waypoint } from "../../../types/waypoints"
import { useState, useEffect } from "react";
import { RoutingService } from "../../../services/routing";


export const useTripRouting = (waypoints: Waypoint[]) => {

    const [routeShape, setRouteShape] = useState<any[]>([]);
    const [stats, setStats] = useState({ distance: 0, duration: 0 });
    const [legStats, setLegStats] = useState<any[]>([]);

    useEffect(() => {
        const calculateTrip = async () => {
            if (waypoints.length < 2) {
                setRouteShape([]);
                setStats({ distance: 0, duration: 0 });
                setLegStats([]);
                return;
            }
            try {
                const maxDay = Math.max(1, ...waypoints.map(w => w.day || 1));
                const dailyRoutes = [];
                let totalDist = 0;
                let totalTime = 0;
                let allLegStats: any[] = [];

                for (let d = 1; d <= maxDay; d++) {
                    // Find waypoints prior to day `d` to connect the route from the last point of the previous days
                    const prevDayWaypoints = waypoints
                        .filter(w => (w.day || 1) < d)
                        .sort((a, b) => (a.day || 1) - (b.day || 1) || (a.stopIndex || 0) - (b.stopIndex || 0));

                    const lastPrevWaypoint = prevDayWaypoints.length > 0 ? prevDayWaypoints[prevDayWaypoints.length - 1] : null;

                    const dayWaypoints = waypoints
                        .filter(w => (w.day || 1) === d)
                        .sort((a, b) => (a.stopIndex || 0) - (b.stopIndex || 0));

                    // Prepend the last stop from the previous day so the line is continuous
                    const routePointsForDay = lastPrevWaypoint && dayWaypoints.length > 0
                        ? [lastPrevWaypoint, ...dayWaypoints]
                        : dayWaypoints;

                    if (routePointsForDay.length >= 2) {
                        const result = await RoutingService.calculateRoute(routePointsForDay);
                        dailyRoutes.push({
                            day: d,
                            routeShape: result.routeShape
                        });
                        totalDist += result.stats.distance;
                        totalTime += result.stats.duration;

                        if (result.legStats) {
                            allLegStats.push(...result.legStats);
                        }
                    }
                }

                setRouteShape(dailyRoutes);
                setStats({ distance: totalDist, duration: totalTime });
                setLegStats(allLegStats);
            } catch (err) {
                console.error("Failed to calculate trip routes:", err);
                setRouteShape([]);
                setStats({ distance: 0, duration: 0 });
                setLegStats([]);
            }
        };
        calculateTrip();
    }, [waypoints]);


    return {
        routeShape,
        setRouteShape,
        stats,
        setStats,
        legStats,
        setLegStats,
    }
}