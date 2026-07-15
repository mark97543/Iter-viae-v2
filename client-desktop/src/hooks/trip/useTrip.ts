/**
 * useTrips.ts
 * @file This file contains the useTrip hook, which is used to manage the trip state.
 */

import { useTripState } from "./SubHooks/useTripState";
import { useTripRouting } from "./SubHooks/useTripRouting";
import { useTripFileEvents } from "./SubHooks/useTripFileEvents";

export function useTrip() {
    const {
        waypoints,
        setWaypoints,
        tripTitle,
        setTripTitle,
        tripSummary,
        setTripSummary,
        tripDate,
        setTripDate,
        tripStartTime,
        setTripStartTime,
        currentDay,
        setCurrentDay,
        addWaypoint,
        deleteWaypoint,
        moveWaypoint,
    } = useTripState();

    const {
        routeShape,
        stats,
        legStats,
    } = useTripRouting(waypoints);

    const tripState = useTripState();
    const {
        showLoadTripModal,
        setShowLoadTripModal,
        save_trip
    } = useTripFileEvents(tripState);

    return {
        waypoints,
        setWaypoints,
        routeShape,
        stats,
        legStats,
        addWaypoint,
        deleteWaypoint,
        moveWaypoint,
        tripTitle,
        setTripTitle,
        showLoadTripModal,
        setShowLoadTripModal,
        currentDay,
        setCurrentDay,
        tripSummary,
        setTripSummary,
        tripStartTime,
        setTripStartTime,
        tripDate,
        setTripDate,
        save_trip,
    };
}