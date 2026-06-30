import { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, emit } from '@tauri-apps/api/event';

// ==========================================
// TYPE DEFINITIONS & DATA CONTRACTS
// ==========================================

interface ModalProps {
    onClose: () => void;
}

interface MapRegion {
    id: string | number;
    name: string;
    parent_region: string;
    file_size_mb: string | number;
    date_updated: string; 
    MBTiles_URL: string;
    Routing_URL: string;
}

interface LocalMapStatus {
    is_found: boolean;
    file_name: string | null;
    date: string | null;
}

interface DownloadProgress {
    file_name: string;
    percentage: number;
}

interface DirectusResponse {
    data: MapRegion[];
}

// ==========================================
// GLOBAL ROUTING BAR COMPONENT
// ==========================================
function GlobalRoutingBar({ routingUrl, onDownloadStart, onDownloadEnd }: { routingUrl: string; onDownloadStart: () => void; onDownloadEnd: () => void; }) {
    const [status, setStatus] = useState<"DOWNLOAD" | "UPDATE" | "READY" | "DOWNLOADING">("DOWNLOAD");
    const [progress, setProgress] = useState(0);

    const routingName = routingUrl.split('/').pop() || "";
    const targetDate = routingName.split('-')[1]?.split('_')[0] || "";

    useEffect(() => {
        const unlisten = listen<DownloadProgress>('download-progress', (event) => {
            if (event.payload.file_name === routingName) {
                setProgress(event.payload.percentage);
                if (event.payload.percentage >= 100) {
                    setStatus("READY");
                    onDownloadEnd();
                }
            }
        });

        const fetchStatus = async () => {
            try {
                const res = await invoke<LocalMapStatus>("check_routing_graph", { routingUrl });
                if (!res.is_found) {
                    setStatus("DOWNLOAD");
                } else if (res.date && targetDate && res.date < targetDate) {
                    setStatus("UPDATE");
                } else {
                    setStatus("READY");
                }
            } catch {
                setStatus("DOWNLOAD");
            }
        };

        fetchStatus();
        return () => { unlisten.then(f => f()); };
    }, [routingUrl, routingName, targetDate]);

    const handleAction = async (action: "DOWNLOAD" | "UPDATE" | "DELETE") => {
        if (action !== "DELETE") {
            setStatus("DOWNLOADING");
            onDownloadStart();
        }
        setProgress(0);

        try {
            if (action === "UPDATE") {
                await invoke("delete_routing_graph");
                await invoke("download_map", { url: routingUrl });
            }
            else if (action === "DELETE") {
                await invoke("delete_routing_graph");
                setStatus("DOWNLOAD");
                await emit('map-downloaded');
            }
            else {
                await invoke("download_map", { url: routingUrl });
            }

            if (action !== "DELETE") {
                await emit('map-downloaded');
            }
        } catch (e) {
            console.error("Global routing action failed:", e);
            setStatus("DOWNLOAD");
        }
    };

    return (
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center px-6">
            <div>
                <h3 className="text-white font-bold tracking-wide flex items-center gap-2">
                    <span className="text-tactical-red">🗺️</span> Unified Valhalla Routing Graph
                </h3>
                <p className="text-gray-400 text-xs mt-1 max-w-lg">
                    Provides offline navigation and turn-by-turn directions across all states. This must be downloaded to enable routing.
                </p>
            </div>
            
            <div className="min-w-[250px] flex justify-end">
                {status === "DOWNLOADING" ? (
                    <div className="w-full max-w-[200px]">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400 font-mono tracking-wider">DOWNLOADING...</span>
                            <span className="text-xs text-tactical-red font-mono">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
                            <div className="bg-tactical-red h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        {status === "READY" ? (
                            <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Installed
                            </span>
                        ) : (
                            <button
                                onClick={() => handleAction(status === "UPDATE" ? "UPDATE" : "DOWNLOAD")}
                                className="px-4 py-1.5 bg-tactical-red hover:bg-red-700 text-white rounded text-sm font-bold uppercase tracking-wide transition-colors shadow-lg shadow-red-900/20"
                            >
                                {status === "UPDATE" ? "UPDATE GRAPH" : "DOWNLOAD GRAPH"}
                            </button>
                        )}

                        {status !== "DOWNLOAD" && (
                            <button
                                onClick={() => handleAction("DELETE")}
                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 border border-transparent hover:border-red-900/50 hover:bg-red-900/20 rounded transition-all"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// INDIVIDUAL MAP ROW COMPONENT (VISUALS ONLY)
// ==========================================
function MapRow({ map, onDownloadStart, onDownloadEnd }: { map: MapRegion; onDownloadStart: () => void; onDownloadEnd: () => void; }) {
    const [status, setStatus] = useState<"DOWNLOAD" | "UPDATE" | "READY" | "DOWNLOADING">("DOWNLOAD");
    const [progress, setProgress] = useState(0);

    const mbtilesName = map.MBTiles_URL.split('/').pop() || "";
    const targetDate = mbtilesName.split('-')[1]?.split('.')[0] || "";

    useEffect(() => {
        const unlisten = listen<DownloadProgress>('download-progress', (event) => {
            if (event.payload.file_name === mbtilesName) {
                setProgress(event.payload.percentage);
                if (event.payload.percentage >= 100) {
                    setStatus("READY");
                    onDownloadEnd();
                }
            }
        });

        const fetchStatus = async () => {
            try {
                const res = await invoke<LocalMapStatus>("check_region_visuals", { mbtilesUrl: map.MBTiles_URL });
                if (!res.is_found) {
                    setStatus("DOWNLOAD");
                } else if (res.date && targetDate && res.date < targetDate) {
                    setStatus("UPDATE");
                } else {
                    setStatus("READY");
                }
            } catch {
                setStatus("DOWNLOAD");
            }
        };

        fetchStatus();
        return () => { unlisten.then(f => f()); };
    }, [map, mbtilesName, targetDate]);

    const handleAction = async (action: "DOWNLOAD" | "UPDATE" | "DELETE") => {
        if (action !== "DELETE") {
            setStatus("DOWNLOADING");
            onDownloadStart();
        }
        setProgress(0);

        try {
            if (action === "UPDATE") {
                await invoke("delete_old_region_visuals", { newMbtilesUrl: map.MBTiles_URL });
                await invoke("download_region_visuals", { mbtilesUrl: map.MBTiles_URL });
            }
            else if (action === "DELETE") {
                await invoke("delete_region_visuals", { mbtilesName });
                setStatus("DOWNLOAD");
                await emit('map-downloaded');
            }
            else {
                await invoke("download_region_visuals", { mbtilesUrl: map.MBTiles_URL });
            }

            if (action !== "DELETE") {
                await emit('map-downloaded');
            }
        } catch (e) {
            console.error("Action failed:", e);
            setStatus("DOWNLOAD");
        }
    };

    return (
        <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
            <td className='p-3 uppercase text-gray-300 font-semibold tracking-wider text-sm'>{map.parent_region}</td>
            <td className='p-3 text-white'>{map.name}</td>
            <td className='p-3 text-gray-400 text-sm'>{map.file_size_mb} MB</td>
            <td className='p-3 min-w-[250px]'>
                {status === "DOWNLOADING" ? (
                    <div className="w-full max-w-[200px]">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-mono w-14">Visuals</span>
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        {status === "READY" ? (
                            <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Installed
                            </span>
                        ) : (
                            <button
                                onClick={() => handleAction(status === "UPDATE" ? "UPDATE" : "DOWNLOAD")}
                                className="px-4 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-sm font-bold uppercase tracking-wide transition-colors shadow-lg shadow-blue-900/20"
                            >
                                {status}
                            </button>
                        )}
                        {status !== "DOWNLOAD" && (
                            <button
                                onClick={() => handleAction("DELETE")}
                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 border border-transparent hover:border-red-900/50 hover:bg-red-900/20 rounded transition-all"
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
    const [mapData, setMapData] = useState<MapRegion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDownloads, setActiveDownloads] = useState(0);

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

    // We construct the "us" routing url based on the date of the maps.
    const globalRoutingUrl = useMemo(() => {
        if (mapData.length === 0) return null;
        const url = mapData[0].Routing_URL;
        const urlParts = url.split('/');
        const filename = urlParts.pop() || "";
        const parts = filename.split('-');
        if (parts.length > 1) {
            const dateAndSuffix = parts.slice(1).join('-');
            urlParts.push(`us-${dateAndSuffix}`);
            return urlParts.join('/');
        }
        return url;
    }, [mapData]);

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
            <div className='flex flex-col bg-canvas-panel border border-neutral-800 w-[90%] max-w-4xl h-[85vh] rounded-xl shadow-2xl overflow-hidden'>
                
                {/* Header Section */}
                <div className="p-6 border-b border-neutral-800 bg-black/20 flex justify-between items-center shrink-0">
                    <div>
                        <h1 className='text-2xl font-bold text-white tracking-wide uppercase'>Map Library</h1>
                        <p className="text-gray-400 text-sm mt-1">Download regions for offline GPS navigation.</p>
                    </div>
                    <button onClick={onClose} disabled={activeDownloads > 0} className="text-gray-500 hover:text-white transition-colors">
                        ✕ Close
                    </button>
                </div>

                {/* Global Routing Bar */}
                {!isLoading && globalRoutingUrl && (
                    <GlobalRoutingBar 
                        routingUrl={globalRoutingUrl} 
                        onDownloadStart={() => setActiveDownloads(prev => prev + 1)}
                        onDownloadEnd={() => setActiveDownloads(prev => prev - 1)}
                    />
                )}

                {/* Table Data Section */}
                <div className='flex-grow overflow-y-auto bg-[#1a1a1a]'>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">
                            Establishing secure connection to Directus...
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-neutral-900 shadow-md z-10">
                                <tr>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Region</th>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Name</th>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Size</th>
                                    <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-widest">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody>
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
                <div className="p-4 border-t border-neutral-800 bg-black/20 flex justify-center shrink-0">
                    <button
                        className='px-8 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg cursor-pointer font-bold tracking-wide transition-colors border border-neutral-700 disabled:opacity-50'
                        onClick={onClose}
                        disabled={activeDownloads > 0}
                    >
                        {activeDownloads > 0 ? "Wait For Downloads" : "Return to Cockpit"}
                    </button>
                </div>
            </div>
        </div>
    );
}