use tauri::{Manager, Emitter}; 
use crate::menu::create_menu; 

pub mod menu;
pub mod maptile;
pub mod tile_server;
pub mod routing;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            maptile::fetch_directus_data,
            maptile::download_map,
            maptile::list_maps,
            maptile::get_local_maps,
            maptile::get_local_routing_tiles,
            maptile::check_region_bundle,
            maptile::download_region_bundle,
            routing::calculate_route,
            maptile::delete_region_bundle,
            maptile::delete_old_region_bundle,
        ])
        .setup(|app| {
            let _ = app.set_menu(create_menu(app.handle()).unwrap());
            
            if let Ok(mut maps_dir) = app.path().app_data_dir() {
                maps_dir.push("maps");
                let _ = std::fs::create_dir_all(&maps_dir);
                tile_server::spawn_server(maps_dir);
            }
            
            Ok(())
        })
        .on_menu_event(|app_handle, event| {
            match event.id().as_ref() {
                "quit" => app_handle.exit(0),
                "debug" => {
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.open_devtools();
                    }
                }
                "loadMap" => {
                    let _ = app_handle.emit("open-load-map-modal", ());
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}