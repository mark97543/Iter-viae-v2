import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Waypoint } from "../../Navigation/navigation.types";

interface LeftBarProps{
    waypoints:Waypoint[];
    setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
}

function LeftBar({waypoints, setWaypoints}:LeftBarProps){
    const [expandBar, setExpandBar]=useState(true);
    

    const BarSelect=()=>{
        setExpandBar(!expandBar);
    }

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = waypoints.findIndex((w: any) => w.id === active.id);
            const newIndex = waypoints.findIndex((w: any) => w.id === over.id);

            const newOrder = arrayMove(waypoints, oldIndex, newIndex);
            setWaypoints(newOrder);
        }
    };

    console.log('Waypoints: ',waypoints);

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
            ${expandBar ? 'w-[300px] h-[calc(100%-1rem)]' : 'w-12 h-12 p-2'}
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
                        <h1 className="text-sm font-bold tracking-wide">Waypoints</h1>
                        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={waypoints ? waypoints.map((w: any) => w.id) : []} strategy={verticalListSortingStrategy}>
                                {/* Map Through the Waypoints and display them */}
                                {waypoints && waypoints.map((point:any,index:any)=>(
                                    <SortableWaypoint key={point.id} point={point} index={index} setWaypoints={setWaypoints}/>
                                )) }
                            </SortableContext>
                        </DndContext>
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

function SortableWaypoint({ point, index, setWaypoints }: { point: any; index: number;setWaypoints:any }) {
    const {attributes, listeners, setNodeRef, transform, transition,} = useSortable({ id: point.id });
    const style = {transform: CSS.Transform.toString(transform), transition,};
    const [edit, setEdit]= useState(false)

    const editMode = (e:any) =>{
        e.stopPropagation();
        setEdit(!edit)
    }

    const deleteItem =(id:string)=>{
        setWaypoints((prev:Waypoint[]) => prev.filter(wp=>wp.id !==id))
    }

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            className="group grid grid-cols-[40px_auto_auto] grid-rows-2 bg-canvas-border/30 p-2 rounded-md border border-canvas-border  hover:bg-canvas-border/50 transition-colors"
        >
            <div {...listeners} className="w-[30px] h-[30px] row-span-2 self-center shrink-0 flex items-center justify-center bg-neutral-900 border-2 border-neutral-500 rounded-full text-[15px] font-mono font-bold text-ui-text group-hover:border-red-500 group-hover:text-red-400 transition-colors shadow-sm cursor-grab active:cursor-grabbing">
                {index + 1}
            </div>
            <span className="text-xs font-bold text-ui-text row-start-1 row-end-1 col-start-2 col-end-2">
                {point.name}
            </span>
            <span>
                {edit ? (
                    <div>
                        <button onClick={(e)=>{editMode(e); deleteItem(point.id)}} className="row-start-1 row-end-1 col-start-3 col-end-3 cursor-pointer">
                            <img className="h-5 w-5 "  src="./trash.png" />                        
                        </button>
                        <button onClick={(e)=>editMode(e)} className="row-start-1 row-end-1 col-start-3 col-end-3 cursor-pointer">
                            <img className="h-5 w-5" src='./save.png' />
                        </button>
                    </div>
                ):(
                    <button onClick={(e)=>{editMode(e)}} className="row-start-1 row-end-1 col-start-3 col-end-3 cursor-pointer">
                        <img className="h-5 w-5 " src="./pencil.png"/>
                    </button>
                )}                
            </span>
            <div className="flex justify-between mt-1 row-start-2 row-end-2 col-start-2 col-end-2">
                <span className="text-[10px] text-ui-muted font-mono">
                    Lat/Lng: {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                </span>
            </div>
        </div>
    );
}

export default LeftBar;