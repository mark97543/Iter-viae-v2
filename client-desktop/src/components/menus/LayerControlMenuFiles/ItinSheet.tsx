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
        legStats,
        dayStartTimes,
        setDayStartTimes
    } = useTripContext();

    if (!visible) return null;

    //Find the number of days
    const maxDays = Math.max(1, ...waypoints.map((wp: Waypoint) => wp.day || 1));

    const addMinutesToTime = (timeStr: string, minutes: number): string => {
        if (!timeStr) return "--:--";
        const [h, m] = timeStr.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return "--:--";
        const totalMinutes = h * 60 + m + minutes;
        const newH = Math.floor(totalMinutes / 60) % 24;
        const newM = Math.floor(totalMinutes % 60);
        return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    }

    const wpTimes: Record<string, { arrival: string, depart: string }> = {};
    let currentTime = tripStartTime || "00:00";
    let currentDay = 1;

    waypoints.forEach((wp: Waypoint, globalIndex: number) => {
        if (wp.day && wp.day !== currentDay) {
            currentDay = wp.day;
            const customStart = dayStartTimes?.find((d: any) => d.day === currentDay);
            currentTime = customStart?.time || "08:00";
        }

        if (wp.stopIndex === 0 && wp.day === 1) {
            currentTime = tripStartTime || "00:00";
        }

        if (wp.stopIndex === 0 && wp.day && wp.day > 1) {
            const customStart = dayStartTimes?.find((d: any) => d.day === wp.day);
            currentTime = customStart?.time || "08:00";
        }

        const arrival = currentTime;
        const stayMins = wp.stay !== undefined ? wp.stay : 30;
        const depart = addMinutesToTime(arrival, stayMins);

        wpTimes[wp.id] = { arrival, depart };

        const leg = legStats[globalIndex];
        if (leg) {
            const driveMins = Math.round(leg.duration / 60);
            currentTime = addMinutesToTime(depart, driveMins);
        }
    });

    //Sets start time
    const StartTime = (wp: Waypoint) => {
        //Return Start Time if its first stop
        if (wp.stopIndex === 0 && wp.day === 1) {
            return (
                <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 text-neutral-600 text-xs font-mono">{tripStartTime || "--:--"}</div>
            )
        }

        //Need Condition to make it editable if on start of next day
        if (wp.stopIndex === 0 && (wp.day || 1) > 1) {
            const dStart = dayStartTimes?.find((d: any) => d.day === wp.day)?.time || "08:00";
            return (
                <input
                    type="time"
                    lang="en-GB"
                    value={dStart}
                    onChange={(e) => {
                        const newTimes = [...(dayStartTimes || [])];
                        const idx = newTimes.findIndex((d: any) => d.day === wp.day);
                        if (idx >= 0) newTimes[idx].time = e.target.value;
                        else newTimes.push({ day: wp.day || 1, time: e.target.value });
                        setDayStartTimes(newTimes);
                    }}
                    className='w-full bg-black/40 border border-tactical-red/50 hover:border-tactical-red rounded-lg py-2 px-1 text-neutral-200 text-xs font-mono focus:outline-none transition-all shadow-inner [color-scheme:dark]'
                />
            )
        }

        //Return for all other with calculation
        return (
            <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 text-neutral-600 text-xs font-mono">{wpTimes[wp.id]?.arrival || "--:--"}</div>
        )
    }

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
                            lang="en-GB"
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
                                            {/* Time Items and Budget */}
                                            <div className="mt-4 grid grid-cols-4 gap-3 text-center items-end">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[9px] font-bold tracking-widest uppercase text-neutral-500">Arrival</label>
                                                    {StartTime(wp)}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[9px] font-bold tracking-widest uppercase text-neutral-500">Stay</label>
                                                    {wp.stopIndex === 0 ? (
                                                        <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 text-neutral-600 text-xs font-mono">--</div>
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={wp.stay !== undefined ? wp.stay : 30}
                                                                onChange={(e) => {
                                                                    setWaypoints(waypoints.map((w: Waypoint) =>
                                                                        w.id === wp.id ? { ...w, stay: Number(e.target.value) } : w
                                                                    ));
                                                                }}
                                                                className='w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-lg py-2.5 pr-6 pl-2 text-neutral-200 text-xs font-mono focus:outline-none focus:border-tactical-red focus:ring-1 focus:ring-tactical-red/50 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner'
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">m</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[9px] font-bold tracking-widest uppercase text-neutral-500">Depart</label>
                                                    <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 text-neutral-600 text-xs font-mono">
                                                        {index === dayWaypoints.length - 1 ? "--:--" : (wpTimes[wp.id]?.depart || "--:--")}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[9px] font-bold tracking-widest uppercase text-tactical-red">Budget</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-medium">$</span>
                                                        <input
                                                            type="number"
                                                            value={wp.budget || ''}
                                                            onChange={(e) => {
                                                                setWaypoints(waypoints.map((w: Waypoint) =>
                                                                    w.id === wp.id ? { ...w, budget: Number(e.target.value) } : w
                                                                ));
                                                            }}
                                                            className='w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-lg py-2.5 pl-6 pr-2 text-neutral-200 text-xs font-mono focus:outline-none focus:border-tactical-red focus:ring-1 focus:ring-tactical-red/50 transition-all text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner'
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Drive Stats to next stop */}
                                            {(() => {
                                                const globalIndex = waypoints.findIndex((w: Waypoint) => w.id === wp.id);
                                                const leg = legStats[globalIndex];
                                                if (!leg || globalIndex === waypoints.length - 1) return null;

                                                return (
                                                    <div className="mt-3 mb-1 flex items-center gap-3 text-[10px] uppercase tracking-widest font-semibold text-neutral-500 bg-neutral-900/50 rounded-lg p-2 border border-white/5 w-max">
                                                        <div className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tactical-red"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
                                                            <span>Drive: {(leg.distance * 0.621371).toFixed(1)} mi</span>
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
