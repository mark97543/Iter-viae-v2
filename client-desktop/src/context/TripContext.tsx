import { createContext, useContext, useState, ReactNode } from 'react';
import { useTrip } from '../hooks/trip/useTrip';

const TripContext = createContext<any>(null);

export function TripProvider({ children }: { children: ReactNode }) {
    const tripData = useTrip(); // All your logic lives here
    return <TripContext.Provider value={tripData}>{children}</TripContext.Provider>;
}

export const useTripContext = () => useContext(TripContext);