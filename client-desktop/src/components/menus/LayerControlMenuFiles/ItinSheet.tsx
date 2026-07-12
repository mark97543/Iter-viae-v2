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
        setTripDate,
        legStats
    } = useTripContext();

    if (!visible) return null;

    //Find the number of days
    const maxDays = Math.max(1, ...waypoints.map((wp: Waypoint) => wp.day || 1));


    console.log("Route Stats: ", legStats);

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
                                const newDate = new Date(e.target.value);
                                setTripDate(newDate);
                                e.target.blur();
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
                                            {/* Drive Stats to next stop */}
                                            {(() => {
                                                const globalIndex = waypoints.findIndex((w: Waypoint) => w.id === wp.id);
                                                const leg = legStats[globalIndex];
                                                if (!leg || globalIndex === waypoints.length - 1) return null;

                                                return (
                                                    <div className="mt-3 mb-1 flex items-center gap-3 text-[10px] uppercase tracking-widest font-semibold text-neutral-500 bg-neutral-900/50 rounded-lg p-2 border border-white/5 w-max">
                                                        <div className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tactical-red"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
                                                            <span>Drive: {leg.distance.toFixed(1)} km</span>
                                                        </div>
                                                        <span className="text-neutral-700">|</span>
                                                        <div className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                            <span>{Math.round(leg.duration / 60)} min</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
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
