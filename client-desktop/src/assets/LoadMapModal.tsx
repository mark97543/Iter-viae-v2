import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// ==========================================
// TYPE DEFINITIONS & DATA CONTRACTS
// ==========================================

// Props for opening/closing the modal from the parent app
interface ModalProps { 
    onClose: () => void; 
}

// The exact structure of the map data coming from your Directus cloud
interface MapRegion {
    id: string | number;
    name: string;
    parent_region: string;
    file_size_mb: string | number;
    file_url: string;
    date_updated: string; // Directus timestamp
}

// The response structure from your Rust backend when checking the local disk
interface LocalMapStatus { 
    is_found: boolean; 
    file_name: string | null; 
    date: string | null; 
}

// The payload sent continuously by Rust during a download
interface DownloadProgress { 
    file_name: string; 
    percentage: number; 
}

// Wrapper for the Directus API response
interface DirectusResponse { 
    data: MapRegion[]; 
}


// ==========================================
// INDIVIDUAL MAP ROW COMPONENT
// ==========================================
// By isolating each row into its own component, we ensure that when one map 
// is downloading, only THIS row re-renders, preventing the whole table from lagging.

function MapRow({ map, onDownloadStart, onDownloadEnd }:{map:MapRegion; onDownloadStart: () => void; onDownloadEnd: () => void;}) {
    // State machine for the row's lifecycle
    const [status, setStatus] = useState<"DOWNLOAD" | "UPDATE" | "READY" | "DOWNLOADING">("DOWNLOAD");
    
    // Tracks the 0-100 percentage of the active download
    const [progress, setProgress] = useState(0);

    // We isolate the filename from the Directus URL. 
    // Example: "https://api.com/idaho-260611.mbtiles" -> "idaho-260611.mbtiles"
    const fileName = map.file_url.split('/').pop() || "";
    
    // Extract the YYMMDD target date from the file name itself for accurate comparison
    // Example: "idaho-260611.mbtiles" -> "260611"
    const targetDate = fileName.split('-')[1]?.split('.')[0] || ""; 

    // -- LIFECYCLE: ON MOUNT --
    useEffect(() => {
        // 1. Set up the Inter-Process Communication (IPC) listener to hear from Rust
        const unlisten = listen<DownloadProgress>('download-progress', (event) => {
            // ONLY update this specific row's progress if the filename matches!
            if (event.payload.file_name === fileName) {
                setProgress(event.payload.percentage);
                
                // If it hits 100%, automatically switch the UI to "READY"
                if (event.payload.percentage >= 100) {
                    setStatus("READY");
                    onDownloadEnd();
                }
            }
        });

        // 2. Ask Rust: "Does this map exist on the hard drive, and is it up to date?"
        const fetchStatus = async () => {
            try {
                // Call the Rust command we built earlier
                const res = await invoke<LocalMapStatus>("check_most_recent_map", { url: map.file_url });
                
                // Compare the pure YYMMDD strings directly
                if (!res.is_found) {
                    setStatus("DOWNLOAD"); // File doesn't exist at all
                } else if (res.date && targetDate && res.date < targetDate) {
                    setStatus("UPDATE"); // File exists, but the file on Directus has a newer YYMMDD stamp
                } else {
                    setStatus("READY"); // File exists and is the latest version
                }
            } catch { 
                setStatus("DOWNLOAD"); // Failsafe fallback
            }
        };

        fetchStatus();

        // 3. Cleanup function: destroys the listener when the row unmounts to prevent memory leaks
        return () => { unlisten.then(f => f()); };
    }, [map, fileName, targetDate]);


    // -- ACTION HANDLER --
    // This is triggered when the user clicks the Download, Update, or Delete buttons
    const handleAction = async (action: "DOWNLOAD" | "UPDATE" | "DELETE") => {
        // Immediately trigger the downloading UI state (Optimistic UI update)
        if (action !== "DELETE") {
            setStatus("DOWNLOADING");
            onDownloadStart();
        }
        setProgress(0); // Reset progress bar

        try {
            if (action === "UPDATE") {
                // Clear the old stale files off the disk first
                await invoke("delete_old_maps", { newUrl: map.file_url });
                // Then pull the new one
                await invoke("download_map", { url: map.file_url });
            } 
            else if (action === "DELETE") {
                // Tell Rust to delete this specific file
                await invoke("delete_map", { fileName });
                // Reset UI back to download state
                setStatus("DOWNLOAD");
            } 
            else {
                // Standard initial download
                await invoke("download_map", { url: map.file_url });
            }
        } catch (e) {
            console.error("Action failed:", e);
            setStatus("DOWNLOAD"); // Revert UI if the Rust command failed
        }
    };

    // -- RENDER ROW --
    return (
        <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
            
            {/* Map Metadata Columns */}
            <td className='p-3 uppercase text-gray-300 font-semibold tracking-wider text-sm'>{map.parent_region}</td>
            <td className='p-3 text-white'>{map.name}</td>
            <td className='p-3 text-gray-400 text-sm'>{map.file_size_mb} MB</td>
            
            {/* Interactive Actions Column */}
            <td className='p-3 min-w-[250px]'>
                
                {/* STATE 1: Actively Downloading -> Show Progress Bar */}
                {status === "DOWNLOADING" ? (
                    <div className="flex items-center gap-3 w-full max-w-[200px]">
                        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
                            <div 
                                className="bg-tactical-red h-2.5 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-300 font-mono w-8">{progress}%</span>
                    </div>
                ) : (
                    
                    /* STATE 2: Idle (Ready, Download, or Update) -> Show Buttons */
                    <div className="flex items-center gap-3">
                        
                        {/* Primary Action Button / Badge */}
                        {status === "READY" ? (
                            // READY BADGE: Not a button, just a sleek green status indicator
                            <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Installed
                            </span>
                        ) : (
                            // DOWNLOAD / UPDATE BUTTON: Primary red tactical button
                            <button 
                                onClick={() => handleAction(status === "UPDATE" ? "UPDATE" : "DOWNLOAD")}
                                className="px-4 py-1.5 bg-tactical-red hover:bg-red-700 text-white rounded text-sm font-bold uppercase tracking-wide transition-colors shadow-lg shadow-red-900/20"
                            >
                                {status}
                            </button>
                        )}

                        {/* Secondary Action: Delete Button (Only shows if map is already on the drive) */}
                        {status !== "DOWNLOAD" && (
                            <button 
                                onClick={() => handleAction("DELETE")} 
                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 border border-transparent hover:border-red-900/50 hover:bg-red-900/20 rounded transition-all"
                                title="Remove from device"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </td>
        </tr>
    );
}


// ==========================================
// MAIN MODAL CONTAINER
// ==========================================

export default function LoadMapModal({ onClose }: ModalProps) {
    // Stores the master list of all available maps from Directus
    const [mapData, setMapData] = useState<MapRegion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDownloads, setActiveDownloads]=useState(0);

    // Fetch the directory from your cloud API when the modal opens
    useEffect(() => {
        const load = async () => {
            try {
                const res = await invoke<DirectusResponse>('fetch_directus_data', { 
                    endpoint: '/items/map_regions?sort=name' 
                });
                setMapData(res.data);
            } catch (error) {
                console.error("Failed to load map directory:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    return (
        // The dark, blurred backdrop
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
            
            {/* The primary modal window */}
            <div className='flex flex-col bg-canvas-panel border border-neutral-800 w-[90%] max-w-4xl h-[85vh] rounded-xl shadow-2xl overflow-hidden'>
                
                {/* Header Section */}
                <div className="p-6 border-b border-neutral-800 bg-black/20 flex justify-between items-center">
                    <div>
                        <h1 className='text-2xl font-bold text-white tracking-wide uppercase'>Map Library</h1>
                        <p className="text-gray-400 text-sm mt-1">Download regions for offline GPS navigation.</p>
                    </div>
                    {/* Top Right subtle close button */}
                    <button onClick={onClose} disabled={activeDownloads > 0} className="text-gray-500 hover:text-white transition-colors">
                        ✕ Close
                    </button>
                </div>

                {/* Table Data Section */}
                <div className='flex-grow overflow-y-auto bg-[#1a1a1a]'>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">
                            Establishing secure connection to Directus...
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            {/* Sticky Header prevents titles from scrolling away */}
                            <thead className="sticky top-0 bg-neutral-900 shadow-md z-10">
                                <tr>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Region</th>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Name</th>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Size</th>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Render a dedicated, self-managing row for every map */}
                                {mapData.map((map) => (
                                    <MapRow 
                                        key={map.id} 
                                        map={map} 
                                        onDownloadStart={() => setActiveDownloads(prev => prev + 1)}
                                        onDownloadEnd={() => setActiveDownloads(prev => prev - 1)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Footer Section */}
                <div className="p-4 border-t border-neutral-800 bg-black/20 flex justify-center">
                    <button 
                        className='px-8 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg cursor-pointer font-bold tracking-wide transition-colors border border-neutral-700' 
                        onClick={onClose}
                        disabled={activeDownloads>0}
                    >
                        {activeDownloads > 0 ? "Wait For Downloads" : "Return to Cockpit"}
                    </button>
                </div>
            </div>
        </div>
    );
}

//TODO: Add a total Diskspace tot he modal
//TODO: Add a search feature to the modal. 