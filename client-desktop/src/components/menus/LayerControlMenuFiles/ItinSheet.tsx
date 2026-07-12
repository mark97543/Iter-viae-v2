// src/components/menus/LayerControlMenuFiles/ItinSheet.tsx

import { useTripContext } from "../../../context/TripContext";


const ItinSheet = ({ visible }: { visible: boolean }) => {
    const { tripTitle, tripSummary, setTripSummary, waypoints, setWaypoints } = useTripContext();

    if (!visible) return null;


    return (
        <div
            className='
                absolute
                right-18
                top-[60px]
                w-[70vw]
                bg-neutral-950/90
                backdrop-blur-lg
                border
                border-neutral-800
                rounded-2xl
                shadow-2xl
                p-4
                flex
                flex-col
                gap-3
                animate-in
                fade-in
                slide-in-from-right-2
                duration-300
                cursor-default'
        >
            <div className="border-b border-neutral-800 pb-2">
                <h1 className='text-xs font-bold tracking-widest uppercase text-neutral-400'>
                    Summary for {tripTitle || 'Trip'}
                </h1>
                <textarea
                    value={tripSummary}
                    onChange={(e) => setTripSummary(e.target.value)}
                    className='w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-300 text-sm focus:outline-none focus:border-tactical-red transition-colors resize-none custom-scrollbar'
                    placeholder="Trip Summary"
                    rows={12}
                />
            </div>


        </div>
    )
}

export default ItinSheet
