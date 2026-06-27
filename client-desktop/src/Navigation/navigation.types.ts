export interface Waypoint {
    id: string;
    name: string;
    coord: {
        lat: number;
        lng: number;
    };
}