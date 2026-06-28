import { invoke } from "@tauri-apps/api/core";

export const MapService = {
    /**
     * Fetch the list of available local MBTiles
     */
    async getLocalMaps(): Promise<string[]> {
        try {
            return await invoke('get_local_maps');
        } catch (error) {
            console.error("MapService failed to fetch maps:", error);
            return [];
        }
    },

    /**
     * Get specific metadata for a map layer (if needed)
     */
    async getMapMetadata(filename: string) {
        try {
            return await invoke('get_map_metadata', { filename });
        } catch (error) {
            console.error(`MapService failed to get metadata for ${filename}:`, error);
            throw error;
        }
    }
};