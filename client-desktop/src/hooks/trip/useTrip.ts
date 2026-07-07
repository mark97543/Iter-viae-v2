/**
 * useTrips.ts
 * @file This file contains the useTrip hook, which is used to manage the trip state.
 */

import { useState, useEffect } from "react";
import { RoutingService } from "../../services/routing";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useModal } from "../../context/ModalContext";

export function useTrip() {
    const [waypoints, setWaypoints] = useState<any[]>([]);
    const [routeShape, setRouteShape] = useState<any[]>([]);
    const [stats, setStats] = useState({ distance: 0, duration: 0 });
    const [tripTitle, setTripTitle] = useState('');
    const { openModal } = useModal();

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
            // Otherwise, the loop repeats and shows the modal again
        }

        // This code runs when the user clicks "Save Route" in the menu
        const dataToSave = JSON.stringify({
            title: currentTitle,
            waypoints: waypoints
        });

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
                    setWaypoints([]);
                    setTripTitle("");
                }

                if (userResponse === "yes") {
                    save_trip();
                    setWaypoints([]);
                    setTripTitle("");
                }

            }
        })

        // Cleanup listener on unmount
        return () => {
            unlisten.then(f => f());
            unlisten2.then(f => f());
        };
    }, [waypoints, tripTitle, openModal]); // Re-run if these change

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