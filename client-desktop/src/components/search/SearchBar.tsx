// src/components/search/SearchBar.tsx

import { useLayout } from "../../context/LayoutContext";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import maplibregl from "maplibre-gl";

interface SearchBarProps {
    map: maplibregl.Map | null;
    onResultSelect?: (result: any) => void;
}

const SearchBar = ({ map, onResultSelect }: SearchBarProps) => {
    const { isLeftBarOpen } = useLayout();
    const [query, setQuery] = useState("");

    const handleSearch = async () => {
        if (query.length > 2) {
            try {
                let userLat = null;
                let userLon = null;
                if (map) {
                    const center = map.getCenter();
                    userLat = center.lat;
                    userLon = center.lng;
                }
                // Run rust function
                const data: any[] = await invoke('search_gazetteer', { query, userLat, userLon });
                if (data.length > 0) {
                    const res = data[0];
                    if (onResultSelect) {
                        onResultSelect(res);
                    } else if (map) {
                        map.flyTo({ center: [res.lon, res.lat], zoom: 14 });
                    }
                    setQuery("");
                }
            } catch (err) {
                console.error('Search failed:', err);
            }
        }
    };

    return (
        <div className={`
                absolute top-4 z-50 w-72
                transition-all duration-500 ease-in-out
                ${isLeftBarOpen ? 'left-[352px]' : 'left-[88px]'}
            `}>
            <input
                type="text"
                placeholder="Search Coordinates"
                className="
                    px-4 py-2 rounded-lg
                    bg-neutral-900/80 backdrop-blur-md
                    text-white border border-white/20
                    shadow-lg outline-none w-full
                    focus:ring-2 focus:ring-violet-500
                    placeholder:text-neutral-400
                "
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                    }
                }}
            />
        </div>
    )
}

export default SearchBar;