export type WaypointType = 'START'|'FUEL'|'SHAPE'|'LODGING'|'WAYPOINT'|'ATTRACTION'|'FOOD';

export interface Waypoint{
    id:string;
    coord:{lng:number;lat:number};
    name:string;
    type:WaypointType;
}

//Helper for initial state creation
export const createDefaultWaypoint = (coord: { lng: number; lat: number }, type: WaypointType = 'WAYPOINT'): Waypoint => ({
    id:crypto.randomUUID(),
    coord,
    name:type === 'WAYPOINT' ? 'New Stop' : type,
    type
});