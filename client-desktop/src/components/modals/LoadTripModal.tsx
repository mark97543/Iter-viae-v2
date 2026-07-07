// src/components/modals/LoadTripModal.tsx
import { useEffect, useState } from "react";
import { useTripContext } from "../../context/TripContext";
import { invoke } from "@tauri-apps/api/core";

const LoadTripModal = () => {
    const { showLoadTripModal, setShowLoadTripModal } = useTripContext();
    const [routes, setRoutes] = useState<any[]>([]);
    const { setWaypoints, setTripTitle } = useTripContext();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await invoke('list_saved_routes');
                setRoutes(data as any[]);
            } catch (err) {
                console.error("Failed to list routes:", err);
            }
        }
        fetchRoutes();
    }, [showLoadTripModal])

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
                            <button
                                key={index}
                                onClick={async () => {
                                    try {
                                        //Invoke the rust command to read file
                                        const tripData = await invoke<string>('load_trip_data', { fileName: route.name });
                                        const parsedData = JSON.parse(tripData);
                                        setWaypoints(parsedData.waypoints || []);
                                        setTripTitle(parsedData.title || route.name.replace(/\.viae$/, ""));
                                        setShowLoadTripModal(false);
                                    } catch (err) {
                                        console.error("Failed to load trip data:", err);
                                    }
                                }}
                                className="w-full cursor-pointer text-left group flex items-center justify-between p-4 rounded-xl bg-neutral-800/30 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-all duration-200"
                            >
                                <span className="text-neutral-200 group-hover:text-white font-medium truncate">
                                    {route.name.replace(/\.viae$/, "")}
                                </span>
                                <span className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                    Load &rarr;
                                </span>
                            </button>
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