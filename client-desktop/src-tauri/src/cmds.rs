//src/cmds.rs

#[macro_export]
macro_rules! generate_commands {
    () => {
        tauri::generate_handler![
            crate::commands::network::fetch_directus_data,
            crate::commands::network::download_map,
            crate::commands::map::list_maps,
            crate::commands::map::get_local_maps,
            crate::commands::map::get_local_routing_tiles,
            crate::commands::map::download_region_visuals,
            crate::commands::map::check_region_visuals,
            crate::commands::map::delete_region_visuals,
            crate::commands::map::delete_old_region_visuals,
            crate::commands::map::check_routing_graph,
            crate::commands::map::delete_routing_graph,
            crate::commands::map::check_gazetteer,
            crate::commands::map::delete_gazetteer,
            crate::commands::routing::calculate_route,
            crate::storage::open_data_folder,
            crate::storage::save_route,
            crate::storage::list_saved_routes,
            crate::storage::load_trip_data,
            crate::storage::import_route,
            crate::storage::delete_route
            
        ]
    };
}