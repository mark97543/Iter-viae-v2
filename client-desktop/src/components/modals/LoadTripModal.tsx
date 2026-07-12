// src/components/modals/LoadTripModal.tsx
import { useEffect, useState } from "react";
import { useTripContext } from "../../context/TripContext";
import { invoke } from "@tauri-apps/api/core";
import trashIcon from '../../assets/icons/trash.png';
import { useModal } from "../../context/ModalContext";

const LoadTripModal = () => {
    const { showLoadTripModal, setShowLoadTripModal } = useTripContext();
    const [routes, setRoutes] = useState<any[]>([]);
    const { setWaypoints, setTripTitle, tripTitle, setTripSummary, setTripDate, setTripStartTime } = useTripContext();
    const { openModal } = useModal();

    const fetchRoutes = async () => {
        try {
            const data = await invoke('list_saved_routes');
            setRoutes(data as any[]);
        } catch (err) {
            console.error("Failed to list routes:", err);
        }
    }

    useEffect(() => {
        fetchRoutes();
    }, [showLoadTripModal])

    const deleteTrip = async (fileName: string) => {
        let filename = fileName

        //Confirm Deletion
        let userDecision = await openModal("DELETE_TRIP")

        if (userDecision === 'yes') {
            try {
                await invoke('delete_route', { fileName: filename });
                await fetchRoutes();
                if (tripTitle == filename.replace(/\.viae$/, "")) {
                    setWaypoints([]);
                    setTripTitle("");
                }
            } catch (err) {
                console.error("Failed to delete route:", err);
            }
        }

    }

    if (!showLoadTripModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-6 pb-4 border-b border-neutral-800">
                    <h2 className="text-white text-xl font-semibold tracking-tight mb-1">Load Trip</h2>
                    <p className="text-neutral-400 text-sm">Select a previously saved trip to continue.</p>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[150px]">
                    {routes.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-neutral-500 text-sm italic">
                            No saved trips found.
                        </div>
                    ) : (
                        routes.map((route, index) => (
                            <div
                                key={index}
                                className="w-full group flex items-center justify-between p-2 rounded-xl bg-neutral-800/30 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-all duration-200"
                            >
                                <button
                                    onClick={async () => {
                                        try {
                                            //Invoke the rust command to read file
                                            const tripData = await invoke<string>('load_trip_data', { fileName: route.name });
                                            const parsedData = JSON.parse(tripData);
                                            setWaypoints(parsedData.waypoints || []);
                                            setTripTitle(parsedData.title || route.name.replace(/\.viae$/, ""));
                                            setTripSummary(parsedData.summary || '');
                                            setTripDate(parsedData.date ? new Date(parsedData.date) : null);
                                            setTripStartTime(parsedData.startTime || null);
                                            setShowLoadTripModal(false);
                                        } catch (err) {
                                            console.error("Failed to load trip data:", err);
                                        }
                                    }}
                                    className="flex-1 text-left cursor-pointer p-2 outline-none"
                                >
                                    <span className="text-neutral-200 group-hover:text-white font-medium truncate">
                                        {route.name.replace(/\.viae$/, "")}
                                    </span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTrip(route.name)
                                    }}
                                    className="p-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity outline-none"
                                    title="Delete Trip"
                                >
                                    <img className="h-4 w-4" src={trashIcon} alt="Delete" style={{ filter: 'brightness(0) saturate(100%) invert(60%) sepia(80%) saturate(1500%) hue-rotate(330deg) brightness(100%) contrast(100%)' }} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex justify-end">
                    <button
                        onClick={() => setShowLoadTripModal(false)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoadTripModal;