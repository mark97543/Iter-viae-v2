// src/components/modals/LoadTripModal.tsx
import { useEffect, useState } from "react";
import { useTripContext } from "../../context/TripContext";
import { invoke } from "@tauri-apps/api/core";

const LoadTripModal = () => {
    const { showLoadTripModal, setShowLoadTripModal } = useTripContext();
    const [routes, setRoutes] = useState<any[]>([]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-96 bg-neutral-900 border border-neutral-700 p-6 shadow-2xl">
                <h2 className="text-white text-lg font-semibold mb-2">Load Trip</h2>
                <p className="text-neutral-400 mb-4">Select a trip to load</p>

                {/*TODO: Need to map through the array */}

                <div>
                    <button
                        onClick={() => setShowLoadTripModal(false)}
                        className="bg-red-900 text-white px-4 py-2 rounded hover:bg-red-800"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LoadTripModal;