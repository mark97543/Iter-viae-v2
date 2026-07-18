
export type WaypointType = 'START' | 'FUEL' | 'SHAPE' | 'LODGING' | 'WAYPOINT' | 'ATTRACTION' | 'FOOD' | 'FINISH';

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

// Define your Tactical Palette
export const TACTICAL_COLORS = {
    GREEN: '#10B981',  // Strong Emerald (good contrast on dark)
    BLUE: '#0EA5E9',   // Sky Blue (readable on dark canvas)
    ORANGE: '#F59E0B', // Amber/Orange
    PURPLE: '#8B5CF6', // Violet
    NEUTRAL: '#A3A3A3',// Muted gray (matches tailwind ui.muted)
    YELLOW: '#EAB308', // Solid yellow
    RED: '#DC2626',    // Matches tailwind tactical.red
};

export const WAYPOINT_CONFIG: Record<WaypointType, { icon: string, color: string, pin: string }> = {
    START: { icon: '🏁', color: TACTICAL_COLORS.GREEN, pin: '/pins/pin-start.svg' },
    FINISH: { icon: '🏁', color: TACTICAL_COLORS.GREEN, pin: '/pins/pin-start.svg' },
    FUEL: { icon: '⛽', color: TACTICAL_COLORS.BLUE, pin: '/pins/pin-fuel.svg' },
    SHAPE: { icon: '🔷', color: TACTICAL_COLORS.BLUE, pin: '/pins/pin-shape.svg' },
    LODGING: { icon: '🏨', color: TACTICAL_COLORS.PURPLE, pin: '/pins/pin-lodging.svg' },
    WAYPOINT: { icon: '📍', color: TACTICAL_COLORS.NEUTRAL, pin: '/pins/pin-default.svg' },
    ATTRACTION: { icon: '🏛️', color: TACTICAL_COLORS.YELLOW, pin: '/pins/pin-attraction.svg' },
    FOOD: { icon: '🍔', color: TACTICAL_COLORS.RED, pin: '/pins/pin-food.svg' },
};