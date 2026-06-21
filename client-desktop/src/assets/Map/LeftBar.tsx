import { useState } from "react";

function LeftBar(){
    const [expandBar, setExpandBar]=useState(true);

    const BarSelect=()=>{
        setExpandBar(!expandBar);
    }

    return(
        <div className={`
            absolute 
            left-2 top-2 z-50 
            bg-canvas-panel/95 
            backdrop-blur-md border 
            border-canvas-border rounded-xl p-3 
            text-ui-text flex flex-col items-start justify-start
            overflow-hidden shadow-2xl
            transition-all duration-300 ease-in-out
            ${expandBar ? 'w-56 h-[calc(100%-1rem)]' : 'w-12 h-12 p-2'}
            `}
        >
            {expandBar ? (
                <div className="flex flex-col gap-4 w-full min-w-[200px]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-canvas-border pb-2.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-ui-muted font-bold">
                            Tactical Map
                        </span>
                        <button 
                            className="p-1 rounded-md hover:bg-canvas-border/80 border border-transparent hover:border-canvas-border transition-all cursor-pointer flex items-center justify-center" 
                            onClick={BarSelect}
                            title="Hide Sidebar"
                        >
                            <img src="./x-close.png" className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" alt="Close" />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col gap-3">
                        <h1 className="text-sm font-bold tracking-wide">Left Bar</h1>
                        <p className="text-xs text-ui-muted font-mono leading-relaxed">
                            Use this panel to manage map operations and settings.
                        </p>
                    </div>
                </div>
            ) : (
                <button 
                    className="w-full h-full flex items-center justify-center rounded-lg hover:bg-canvas-border transition-colors cursor-pointer" 
                    onClick={BarSelect}
                    title="Show Sidebar"
                >
                    <img src="./HamBut.png" className="w-5 h-5 opacity-80 hover:opacity-100 transition-opacity" alt="Menu" />
                </button>
            )}
            
        </div>
    )
}

export default LeftBar; 