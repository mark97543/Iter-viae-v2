import {useState, useEffect} from 'react';
import {invoke} from '@tauri-apps/api/core';
import {listen} from '@tauri-apps/api/event';

export const useLocalMaps = () =>{
    const [mapFiles, setMapFiles] =useState<string[]>([]);

    const fetchMaps = async () => {
        try {
            const files = await invoke<string[]>('list_maps');
            console.log("TacticalMap updated mapFiles list:", files);
            setMapFiles(files);
        } catch (err) {
            console.error("Failed to load map list:", err);
        }
    };

    useEffect(()=>{
        fetchMaps();
        // Listen for the event globally
        const unlisten = listen('map-downloaded', () => {
            console.log("TacticalMap heard 'map-downloaded'! Refreshing...");
            fetchMaps();
        });

        // Cleanup on unmount
        return () => {
            unlisten.then((f) => f());
        };
    }, []);

    return mapFiles;
}