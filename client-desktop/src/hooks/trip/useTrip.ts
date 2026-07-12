/**
 * useTrips.ts
 * @file This file contains the useTrip hook, which is used to manage the trip state.
 */

import { useState, useEffect } from "react";
import { RoutingService } from "../../services/routing";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useModal } from "../../context/ModalContext";
import { save, open } from "@tauri-apps/plugin-dialog";
import { Waypoint, createDefaultWaypoint, Day_Start_Time, createDefaultDayStartTime } from "../../types/waypoints";

export function useTrip() {
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [routeShape, setRouteShape] = useState<any[]>([]);
    const [stats, setStats] = useState({ distance: 0, duration: 0 });
    const [legStats, setLegStats] = useState<any[]>([]);
    const [tripTitle, setTripTitle] = useState('');
    const { openModal } = useModal();
    const [showLoadTripModal, setShowLoadTripModal] = useState(false);
    const [currentDay, setCurrentDay] = useState(1);
    const [tripSummary, setTripSummary] = useState('');
    const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
    const [tripDate, setTripDate] = useState<Date | null>(null);
    const [dayStartTimes, setDayStartTimes] = useState<Date[]>([]);



    //Data Package
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

    //clearing Cunction

    function clear_trip() {
        setWaypoints([]);
        setTripTitle("");
        setTripSummary("");
        setTripStartTime(null);
        setTripDate(null);
        setDayStartTimes([]);
    }

    //Save Trip Function
    const save_trip = async () => {
        let currentTitle = tripTitle;

        // Loop until we get a valid title or the user cancels
        while (!currentTitle || currentTitle.trim() === "") {
            const newTitle = await openModal("ERR_NO_TITLE");

            // If user clicks Cancel, newTitle is null. Abort the save.
            if (newTitle === null || newTitle === undefined) {
                return;
            }

            // If the user typed a valid title (not just spaces)
            if (typeof newTitle === "string" && newTitle.trim() !== "") {
                currentTitle = newTitle.trim();
                setTripTitle(currentTitle);
                break;
            }
        }

        const dataToSave = data_package();

        try {
            await invoke("save_route", {
                routeName: currentTitle,
                data: dataToSave
            });
            console.log("Trip saved successfully!");
        } catch (err) {
            console.error("Failed to save trip:", err);
        }

    }

    //Listener for menu options
    useEffect(() => {
        const unlisten = listen("trigger-save", async () => {
            save_trip();
        });

        const unlisten2 = listen("trigger-new-trip", async () => {
            console.log("Trigger new Trip")

            if (waypoints.length > 0 || tripTitle.trim() !== "") {
                const userResponse = await openModal("SAVE_PROGRESS");

                if (userResponse === "no") {
                    clear_trip();
                }

                if (userResponse === "yes") {
                    save_trip();
                    clear_trip();
                }
            }
        });

        const unlisten3 = listen("load-route", async () => {

            if (waypoints.length > 0 || tripTitle.trim() !== "") {
                const userResponse = await openModal("SAVE_PROGRESS");

                if (userResponse === "no") {
                    clear_trip();
                }

                if (userResponse === "yes") {
                    save_trip();
                    //clear_trip();
                }

            }

            setShowLoadTripModal(true);

        });

        const unlisten4 = listen("open-save-dialog", async () => {
            //Open Native Dialog as save-as
            const filePath = await save({
                filters: [{
                    name: 'Iter Viae Route',
                    extensions: ['viae']
                }],
                defaultPath: `${tripTitle || 'my-route'}.viae`
            });

            if (filePath) {
                // Call the unified command
                const dataToSave = data_package();

                await invoke("save_route", {
                    routeName: tripTitle,
                    data: dataToSave,
                    customPath: filePath // Rust now handles this via Option<String>
                });
            }
        })

        const unlisten5 = listen("open-load-dialog", async () => {

            //Open the native OS file picker
            const selectedFile = await open({
                multiple: false,
                filters: [{
                    name: 'Iter Viae Route',
                    extensions: ['viae']
                }]
            });

            //Handle File Selection
            const filePath = typeof selectedFile === 'string' ? selectedFile : null;

            if (filePath) {
                try {
                    //Invoke rust to read file
                    const fileContent: string = await invoke("import_route", { fileName: filePath });

                    //Parse the data and update the react state
                    const parsedData = JSON.parse(fileContent);
                    setWaypoints(parsedData.waypoints);
                    setTripTitle(parsedData.title);
                    setTripDate(parsedData.date);
                    setTripStartTime(parsedData.startTime);
                    setTripSummary(parsedData.summary);
                    setDayStartTimes(parsedData.dayStartTimes);

                    console.log("Trip Loaded Successfully!")
                } catch (err) {
                    console.error("Error loading route from file:", err);
                }
            }

        })

        // Cleanup listener on unmount
        return () => {
            unlisten.then(f => f());
            unlisten2.then(f => f());
            unlisten3.then(f => f());
            unlisten4.then(f => f());
            unlisten5.then(f => f());
        };
    }, [waypoints, tripTitle, tripSummary, tripDate, tripStartTime, dayStartTimes, openModal]); // Re-run if these change

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
    };
}