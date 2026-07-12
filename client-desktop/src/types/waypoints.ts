
export type WaypointType = 'START' | 'FUEL' | 'SHAPE' | 'LODGING' | 'WAYPOINT' | 'ATTRACTION' | 'FOOD';

export interface Waypoint {
    id: string;
    coord: { lng: number; lat: number };
    name: string;
    type: WaypointType;
    day?: number;
    stopIndex?: number;
    note?: string;
    budget?: number;
    stay?: number;
}

//Helper for initial state creation
export const createDefaultWaypoint = (coord: { lng: number; lat: number }, type: WaypointType = 'WAYPOINT'): Waypoint => ({
    id: crypto.randomUUID(),
    coord,
    name: type === 'WAYPOINT' ? 'New Stop' : type,
    type,
    day: 1,
    stopIndex: 0,
    budget: 0,
    stay: 0, // 0 minutes default stay
    note: ''
});

export interface Day_Start_Time {
    day: number;
    time: string;
    wpIndex?: number;
}

export const createDefaultDayStartTime = (day: number, time: string): Day_Start_Time => ({
    day,
    time,
    wpIndex: 0
});