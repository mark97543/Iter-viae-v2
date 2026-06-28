/**
 * AddPoint.tsx
 * @file This is the modalwhich pops up when the user right clicks on the map.
 * @description This modal is used to add a new waypoint to the trip.
 */

import { useTripContext } from "../../../hooks/trip/TripContext";

interface AddPointProps {
    isOpen: boolean;
    onConfirm: () => void;
}

function AddPoint({ isOpen, onConfirm }: AddPointProps) {
    const { addWaypoint } = useTripContext();

    if (!isOpen) return null;

    return (
        <div className={`
            absolute bottom-0 left-1/2 -translate-x-1/2 z-40
            w-full max-w-sm
            bg-canvas-panel/95 border-t border-x border-canvas-border rounded-t-xl p-4
            transition-all duration-300 ease-out
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
            `}
            onClick={(e) => e.stopPropagation()}
        >
            <button className="w-full bg-tactical-red hover:bg-tactical-hover text-white font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-lg transition-all duration-200 cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.2)] hover:shadow-[0_0_12px_rgba(220,38,38,0.3)]"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onConfirm();
                }}
            >
                [ Add Waypoint ]
            </button>
        </div>
    );
}

export default AddPoint;