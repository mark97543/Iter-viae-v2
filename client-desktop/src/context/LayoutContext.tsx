// src/context/LayoutContext.tsx

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

const LayoutContext = createContext({
    isLeftBarOpen: true,
    setIsLeftBarOpen: (value: boolean) => { },
    summaryBar: false,
    setSummaryBar: (value: boolean) => { }
})

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [isLeftBarOpen, setIsLeftBarOpen] = useState(true);
    const [summaryBar, setSummaryBar] = useState(false);

    //if the summary bar is open, the left bar should be closed
    useEffect(() => {
        setSummaryBar(!isLeftBarOpen);
    }, [isLeftBarOpen]);

    return (
        <LayoutContext.Provider value={{
            isLeftBarOpen,
            setIsLeftBarOpen,
            summaryBar,
            setSummaryBar
        }}>
            {children}
        </LayoutContext.Provider>
    )

}

export const useLayout = () => useContext(LayoutContext)