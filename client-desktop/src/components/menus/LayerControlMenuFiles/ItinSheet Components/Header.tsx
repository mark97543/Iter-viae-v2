// src/components/menus/LayerControlMenuFiles/ItinSheet Components/Header.tsx

import { useTripContext } from "../../../../context/TripContext";

const Header = () => {
    const {
        tripTitle,
        tripSummary,
        setTripSummary,
        tripDate,
        setTripStartTime,
        tripStartTime,
        setTripDate
    } = useTripContext();


    return (
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
    )
}

export default Header;