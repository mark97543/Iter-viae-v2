import { useTripContext } from '../../../context/TripContext';
import { useState, useEffect } from 'react';
import { Waypoint } from '../../../types/waypoints';

const Dropdown = () => {

    const { currentDay, setCurrentDay, waypoints } = useTripContext();

    // Include currentDay in the max calculation so the new day option actually renders!
    const maxDay = Math.max(1, currentDay, ...waypoints.map((w: Waypoint) => w.day || 0));

    const addDay = () => {
        setCurrentDay(maxDay + 1)
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        if (value === 100) {
            addDay();
            // Optional: Auto-select the newly created day
            // setCurrentDay(maxDay + 1); 
        } else {
            setCurrentDay(value);
        }
    };

    return (
        <div className="relative w-full px-1 mb-2">
            <select
                className="w-full bg-black/40 text-neutral-200 font-medium text-sm border border-white/5 hover:border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-inner cursor-pointer appearance-none"
                value={currentDay}
                onChange={handleChange}
            >
                <option className="bg-neutral-900 text-neutral-200" key={100} value={100}>+ Add Day</option>
                {Array.from({ length: maxDay }, (_, i) => (
                    <option className="bg-neutral-900 text-neutral-200" key={i + 1} value={i + 1}>Day {i + 1}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                ▼
            </div>
        </div>
    );
};

export default Dropdown;