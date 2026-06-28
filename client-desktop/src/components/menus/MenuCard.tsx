import React, {useState} from 'react';

interface MenuCardProps {
    poi: any;
    onAddWaypoint?: (poiData: any) => void;
}

function MenuCard({ poi, onAddWaypoint }: MenuCardProps) {
    const isOpen = !!poi; //Boolean Check to handle the transition classes
    const properties = poi?.prop.properties;
    const name = properties?.name || properties?.subclass;
    const subclass = properties?.subclass || 'Unknown';
    const lng = poi?.coord?.lng.toFixed(6);
    const lat = poi?.coord?.lat.toFixed(6);
    const coordsString = `${lat}, ${lng}`

    const [copied, setCopied]=useState(false)
    const copyToClipboard = () =>{
        navigator.clipboard.writeText(coordsString);
        setCopied(true)
        setTimeout(() => setCopied(false), 2000); // Reset feedback after 2s
    }

    return (
        <div className={`
                /*Positioning and Layout */
                absolute bottom-0 left-1/2 -translate-x-1/2
                z-40 w-full max-w-sm
                /*Aesthetics */
                bg-neutral-950/95 border-t border-x border-neutral-800 rounded-t-xl p-4
                /*Animation */
                transition-all duration-300 ease-out
                ${poi ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header Row */}
           <div className="flex justify-between items-start mb-4">
                <h1 className="text-white font-mono text-xl uppercase tracking-wider first-letter:text-red-500 first-letter:font-bold">
                    {name}
                </h1>
                <span className="shrink-0 font-bold font-mono text-[10px] bg-red-600/20 text-red-400 border border-red-500/50 px-2.5 py-0.5 rounded shadow-[0_0_8px_rgba(220,38,38,0.2)]">
                        {subclass}
                </span>
           </div>

           {/* Telemetry Actions */}
           <div className="flex justify-between items-center bg-neutral-900 p-3 rounded border border-neutral-800">
                <span className="font-mono text-neutral-400 text-xs">
                    {coordsString}
                </span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard();
                    }}
                    className={`font-mono text-xs uppercase px-3 py-1 rounded transition-colors ${copied ? 'bg-green-900 text-green-300' : 'bg-red-900/20 text-red-500 hover:bg-red-900/40'}`}
                >
                    {copied ? '[ COPIED ]' : '[ COPY ]'}
                </button>
           </div>

           {/*Add Point Buttong */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if (onAddWaypoint && poi) {
                        onAddWaypoint({
                            name: name || 'Waypoint',
                            coord: poi.coord
                        });
                    }
                }}
                className="w-full mt-3 bg-tactical-red hover:bg-tactical-hover text-white font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-lg transition-all duration-200 cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.2)] hover:shadow-[0_0_12px_rgba(220,38,38,0.3)]"
            >
                [ Add Waypoint ]
            </button>
        </div>
    );
}

export default MenuCard;
