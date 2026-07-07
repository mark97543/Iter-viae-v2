import xCloseIcon from '../../assets/icons/x-close.png';
import hamButIcon from '../../assets/icons/HamBut.png';
import saveIcon from '../../assets/icons/save.png';
import trashIcon from '../../assets/icons/trash.png';
import pencilIcon from '../../assets/icons/pencil.png';
import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Waypoint } from "../../types/navigation.types";
import { useTripContext } from "../../context/TripContext";

function LeftBar() {
    const [expandBar, setExpandBar] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const { waypoints, setWaypoints, setTripTitle, tripTitle } = useTripContext();

    const BarSelect = () => {
        setExpandBar(!expandBar);
    }

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = waypoints.findIndex((w: any) => w.id === active.id);
        const newIndex = waypoints.findIndex((w: any) => w.id === over.id);

        setWaypoints(arrayMove(waypoints, oldIndex, newIndex));
    };

    return (
        <div className={`
            absolute 
            left-4 top-4 z-50 
            bg-neutral-900/70 backdrop-blur-xl
            border border-white/10 rounded-2xl p-4 
            text-neutral-200 flex flex-col items-start justify-start
            overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]
            transition-all duration-500 ease-in-out
            ${expandBar ? 'w-[320px] h-[calc(100%-2rem)]' : 'w-14 h-14 p-2.5 rounded-xl'}
            `}
        >
            {expandBar ? (
                <div className="flex flex-col gap-5 w-full h-full max-h-full min-w-[200px]">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 shrink-0">
                        <input
                            type="text"
                            value={tripTitle}
                            onChange={(e) => setTripTitle(e.target.value)}
                            placeholder='Name your trip...'
                            className="bg-black/40 text-white font-medium text-lg w-full border border-white/5 hover:border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl px-3.5 py-2.5 transition-all shadow-inner placeholder:text-neutral-600"
                        />
                        <button
                            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm group"
                            onClick={BarSelect}
                            title="Hide Sidebar"
                        >
                            <img src={xCloseIcon} className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" alt="Close" />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                        <h1 className="text-xs font-bold tracking-widest uppercase text-neutral-400 shrink-0 px-1">Waypoints</h1>
                        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <div className="flex flex-col gap-3 pb-4">
                                <SortableContext items={waypoints ? waypoints.map((w: any) => w.id) : []} strategy={verticalListSortingStrategy}>
                                    {/* Map Through the Waypoints and display them */}
                                    {waypoints && waypoints.map((point: any, index: any) => (
                                        <SortableWaypoint
                                            key={point.id}
                                            point={point}
                                            index={index}
                                            editingId={editId}
                                            setEditingId={setEditId}
                                        />
                                    ))}
                                    {waypoints.length === 0 && (
                                        <div className="text-center p-6 border border-dashed border-white/10 rounded-xl text-neutral-500 text-sm flex flex-col items-center gap-2">
                                            <span className="text-2xl">🗺️</span>
                                            <p>No waypoints yet.<br />Click the map to add one.</p>
                                        </div>
                                    )}
                                </SortableContext>
                            </div>
                        </DndContext>
                    </div>
                </div>
            ) : (
                <button
                    className="w-full h-full flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={BarSelect}
                    title="Show Sidebar"
                >
                    <img src={hamButIcon} className="w-5 h-5 opacity-80 hover:opacity-100 transition-opacity" alt="Menu" />
                </button>
            )}

        </div>
    )
}

function SortableWaypoint({ point, index, editingId, setEditingId }: { point: any; index: number; editingId: string | null; setEditingId: (id: string | null) => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition, } = useSortable({ id: point.id });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        ...(transform ? { zIndex: 50, position: 'relative' as const } : {})
    };
    const [name, setName] = useState('');
    const [copied, setCopied] = useState(false);
    const { deleteWaypoint, setWaypoints, waypoints } = useTripContext();

    const isEditing = editingId === point.id;

    const deleteItem = (id: string) => {
        deleteWaypoint(id);
    }

    const saveItem = (id: string) => {
        const trimmedName = name.trim();
        setWaypoints((prev: Waypoint[]) =>
            prev.map((wp: Waypoint) => (wp.id === id ? { ...wp, name: trimmedName || wp.name } : wp))
        );
        setEditingId(null);
    }

    const copyCoordinates = () => {
        const coordsText = `${point.coord.lat.toFixed(6)}, ${point.coord.lng.toFixed(6)}`;
        navigator.clipboard.writeText(coordsText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="group grid grid-cols-[36px_1fr_auto] gap-x-3 items-center bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 p-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
        >
            <div
                {...listeners}
                className="w-8 h-8 row-span-2 self-center shrink-0 flex items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/10 rounded-full text-xs font-mono font-bold text-white shadow-lg group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all cursor-grab active:cursor-grabbing touch-none"
            >
                {index + 1}
            </div>
            <span className="text-sm font-semibold text-white row-start-1 row-end-1 col-start-2 col-end-2 flex items-center pr-2">
                {isEditing ? (
                    <input
                        className="bg-black/60 text-white border border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-md px-2.5 py-1 w-full text-sm outline-none transition-all"
                        placeholder={point.name}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        maxLength={26}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveItem(point.id);
                            if (e.key === 'Escape') setEditingId(null);
                        }}
                    />
                ) : (
                    <div className="line-clamp-2 truncate">{point.name}</div>
                )}
            </span>
            <div className="row-start-1 row-end-1 col-start-3 col-end-3 flex items-center gap-1.5 justify-end">
                {isEditing ? (
                    <>
                        <button
                            onClick={() => saveItem(point.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                            title="Save"
                        >
                            <img className="h-4 w-4 opacity-80" src={saveIcon} alt="Save" style={{ filter: 'brightness(0) saturate(100%) invert(75%) sepia(50%) saturate(600%) hue-rotate(90deg) brightness(95%) contrast(90%)' }} />
                        </button>
                        <button
                            onClick={() => {
                                deleteItem(point.id);
                                setEditingId(null);
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                        >
                            <img className="h-4 w-4 opacity-80" src={trashIcon} alt="Delete" style={{ filter: 'brightness(0) saturate(100%) invert(60%) sepia(80%) saturate(1500%) hue-rotate(330deg) brightness(100%) contrast(100%)' }} />
                        </button>
                    </>
                ) : (
                    <button
                        disabled={editingId !== null && editingId !== point.id}
                        onClick={() => {
                            setEditingId(point.id);
                            setName(point.name);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                        title="Edit"
                    >
                        <img className="h-3.5 w-3.5 opacity-80" src={pencilIcon} alt="Edit" />
                    </button>
                )}
            </div>
            <div className="flex justify-between mt-1 row-start-2 row-end-2 col-start-2 col-end-4">
                <button
                    onClick={copyCoordinates}
                    className="text-[10px] text-neutral-500 font-mono hover:text-neutral-300 transition-colors flex items-center gap-2 cursor-pointer text-left w-full select-none" >
                    <span className="truncate">Lat/Lng: {point.coord.lat.toFixed(5)}, {point.coord.lng.toFixed(5)}</span>
                    {copied ? (
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center shrink-0 bg-emerald-500/10 px-1.5 rounded">
                            ✓ Copied
                        </span>
                    ) : (
                        ''
                    )}
                </button>
            </div>
        </div>
    );
}

export default LeftBar;