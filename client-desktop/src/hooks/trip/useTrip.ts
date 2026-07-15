/**
 * useTrips.ts
 * @file This file contains the useTrip hook, which is used to manage the trip state.
 */

import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useModal } from "../../context/ModalContext";
import { save, open } from "@tauri-apps/plugin-dialog";
import { useTripState } from "./SubHooks/useTripState";
import { useTripRouting } from "./SubHooks/useTripRouting";

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
        dayStartTimes,
        setDayStartTimes,
        currentDay,
        setCurrentDay,
        addWaypoint,
        deleteWaypoint,
        moveWaypoint,
        clear_trip,
        data_package
    } = useTripState();

    const {
        routeShape,
        stats,
        legStats,
    } = useTripRouting(waypoints);




    const { openModal } = useModal();
    const [showLoadTripModal, setShowLoadTripModal] = useState(false);

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