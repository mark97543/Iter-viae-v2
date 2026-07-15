// src/hooks/trip/SubHooks/useTripState.ts
/**
 * useTripState.ts
 * @file This hook is responsible for maintaining the core data of a trip. 
 * It stores all metadata (title, summary, dates) and handles the precise logic 
 * for modifying the waypoints array. By separating this from the main useTrip hook,
 * the data layer remains completely decoupled from OS interactions and routing calculations.
 */

import { useState } from "react";
import { Waypoint } from "../../../types/waypoints";
import { createDefaultWaypoint } from "../../../types/waypoints";

/**
 * Core Trip State Hook
 * Manages the raw data for a trip and provides the methods to mutate it safely.
 */
export const useTripState = () => {
    // --- Core Trip Data ---
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [tripTitle, setTripTitle] = useState('');
    const [tripSummary, setTripSummary] = useState('');
    const [tripDate, setTripDate] = useState<Date | null>(null);
    const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
    const [dayStartTimes, setDayStartTimes] = useState<Date[]>([]);
    const [currentDay, setCurrentDay] = useState(1);

    /**
     * Adds a new waypoint to the trip.
     * Automatically calculates the correct stop index by finding the 
     * highest current index for the selected day and appending to it.
     * 
     * @param poi The Point of Interest data (coordinates, type, name, etc.)
     */
    const addWaypoint = (poi: any) => {
        setWaypoints(prev => {
            // Calculate the next stop index for the current day
            const waypointsForDay = prev.filter(wp => wp.day === currentDay);
            const nextStopIndex = waypointsForDay.length > 0
                ? Math.max(...waypointsForDay.map(wp => wp.stopIndex || 0)) + 1
                : 0;

            const newWaypoint = createDefaultWaypoint(poi.coord, poi.type);

            return [...prev, {
                ...newWaypoint,
                ...poi,
                day: currentDay,
                stopIndex: nextStopIndex
            }];
        });
    };

    /**
     * Removes a waypoint from the trip by its unique ID.
     */
    const deleteWaypoint = (id: string) => {
        setWaypoints(prev => prev.filter(wp => wp.id !== id));
    };

    /**
     * Updates the coordinates of an existing waypoint.
     * Useful for drag-and-drop or manual adjustments on the map.
     */
    const moveWaypoint = (id: string, newCoords: { lat: number, lng: number }) => {
        setWaypoints(prev => prev.map(wp => wp.id === id ? { ...wp, coord: newCoords } : wp));
    };

    /**
     * Resets the entire trip state back to its default/empty values.
     * Used when starting a new trip or clearing unsaved progress.
     */
    function clear_trip() {
        setWaypoints([]);
        setTripTitle("");
        setTripSummary("");
        setTripStartTime(null);
        setTripDate(null);
        setDayStartTimes([]);
    }

    /**
     * Packages the current state into a structured JSON string.
     * This is the exact format expected by the Rust backend when saving to disk.
     */
    function data_package() {
        const dataToSave = JSON.stringify({
            title: tripTitle,
            summary: tripSummary,
            date: tripDate,
            startTime: tripStartTime,
            dayStartTimes: dayStartTimes,
            waypoints: waypoints
        });
        return dataToSave;
    }

    return {
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
        dayStartTimes,
        setDayStartTimes,
        currentDay,
        setCurrentDay,
        addWaypoint,
        deleteWaypoint,
        moveWaypoint,
        clear_trip,
        data_package
    }
}