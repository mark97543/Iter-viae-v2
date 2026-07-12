// src/components/menus/LayerControlMenuFiles/ItinSheet.tsx

import { useTripContext } from "../../../context/TripContext";
import { Waypoint } from "../../../types/waypoints";


const ItinSheet = ({ visible }: { visible: boolean }) => {
    const { tripTitle,
        tripSummary,
        setTripSummary,
        waypoints,
        setWaypoints,
        tripStartTime,
        setTripStartTime,
        tripDate,
        setTripDate
    } = useTripContext();

    if (!visible) return null;

    //Find the number of days
    const maxDays = Math.max(1, ...waypoints.map((wp: Waypoint) => wp.day || 1));

    return (
        <div
            className='
                fixed
                right-24
                top-[-40vh]
                h-[90vh]
                w-[80vw]
                max-w-5xl
                bg-neutral-950/90
                backdrop-blur-lg
                border
                border-neutral-800
                rounded-2xl
                shadow-2xl
                p-6
                flex
                flex-col
                gap-4
                animate-in
                fade-in
                slide-in-from-right-2
                duration-300
                cursor-default
                overflow-y-scroll
                '
        >
            <div className="border-b border-neutral-800 pb-5 shrink-0 flex flex-col gap-4">
                <h1 className='text-sm font-bold tracking-widest uppercase text-neutral-400'>
                    Summary for {tripTitle || 'Trip'}
                </h1>

                <textarea
                    value={tripSummary}
                    onChange={(e) => setTripSummary(e.target.value)}
                    className='w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl p-3 text-neutral-300 text-sm focus:outline-none focus:border-tactical-red focus:ring-1 focus:ring-tactical-red/50 transition-all resize-none custom-scrollbar shadow-inner'
                    placeholder="Enter a description or summary of your trip..."
                    rows={4}
                />

                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-1">Start Date</label>
                        <input
                            type="date"
                            value={tripDate ? new Date(tripDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                // Create a new date from the string, set it as an object
                                const newDate = new Date(e.target.value);
                                setTripDate(newDate);
                                e.target.blur(); // Force close the native picker
                            }}
                            className='w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl p-3 text-neutral-300 text-sm focus:outline-none focus:border-tactical-red focus:ring-1 focus:ring-tactical-red/50 transition-all shadow-inner [color-scheme:dark]'
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-1">Start Time</label>
                        <input
                            type="time"
                            value={tripStartTime || '00:00'}
                            onChange={(e) => {
                                setTripStartTime(e.target.value as any);
                            }}
                            className='w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl p-3 text-neutral-300 text-sm focus:outline-none focus:border-tactical-red focus:ring-1 focus:ring-tactical-red/50 transition-all shadow-inner [color-scheme:dark]'
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
                {Array.from({ length: maxDays }).map((_, i) => {
                    const dayWaypoints = waypoints
                        .filter((wp: Waypoint) => (wp.day || 1) === i + 1)
                        .sort((a: Waypoint, b: Waypoint) => (a.stopIndex || 0) - (b.stopIndex || 0));

                    return (
                        <div key={i} className="bg-neutral-900/50 p-4 rounded-xl border border-white/5">
                            <h1 className='text-xs font-bold tracking-widest uppercase text-tactical-red mb-3 border-b border-white/5 pb-2'>
                                Day {i + 1}
                            </h1>

                            <div className="flex flex-col gap-3 pl-2">
                                {dayWaypoints.length > 0 ? (
                                    dayWaypoints.map((wp: Waypoint, index: number) => (
                                        <div key={wp.id} className="relative pl-4 border-l border-neutral-700">
                                            {/* Small dot on the timeline */}
                                            <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-neutral-600 border-2 border-neutral-900" />
                                            <input
                                                className='
                                                    w-full bg-neutral-900 border border-neutral-800 
                                                    rounded-lg p-2 text-neutral-200 text-sm font-medium
                                                    focus:outline-none focus:border-tactical-red 
                                                    transition-colors mb-2'
                                                value={wp.name}
                                                onChange={(e) => {
                                                    setWaypoints(waypoints.map((w: Waypoint) =>
                                                        w.id === wp.id ? { ...w, name: e.target.value } : w
                                                    ));
                                                }}
                                            />
                                            <textarea
                                                className='
                                                    w-full bg-black/40 border border-white/5
                                                    rounded-lg p-2 text-neutral-400 text-xs italic
                                                    focus:outline-none focus:border-tactical-red/50
                                                    transition-colors resize-none custom-scrollbar'
                                                rows={2}
                                                placeholder="Add a note..."
                                                value={wp.note || ''}
                                                onChange={(e) => {
                                                    setWaypoints(waypoints.map((w: Waypoint) =>
                                                        w.id === wp.id ? { ...w, note: e.target.value } : w
                                                    ));
                                                }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-neutral-500 italic pl-4">No stops planned for this day.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    )
}

export default ItinSheet
