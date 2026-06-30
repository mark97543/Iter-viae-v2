//src/lib.rs

use tauri::{Manager, Emitter}; 
use crate::menu::create_menu; 
use std::sync::Mutex;
use valhalla::Actor;

pub mod menu;
pub mod modules;    // This holds your pure logic (maptile.rs, etc.)
pub mod commands;   // This holds your API gateway (map.rs, etc.)

pub struct ValhallaState(pub Mutex<Option<Actor>>);



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ValhallaState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            commands::network::fetch_directus_data,
            commands::network::download_map,
            commands::map::list_maps,
            commands::map::get_local_maps,
            commands::map::get_local_routing_tiles,

            commands::map::download_region_visuals,
            commands::map::check_region_visuals,
            commands::map::delete_region_visuals,
            commands::map::delete_old_region_visuals,
            commands::map::check_routing_graph,
            commands::map::delete_routing_graph,
            commands::routing::calculate_route,
        ])
        .setup(|app| {
            let _ = app.set_menu(create_menu(app.handle()).unwrap());
            
            if let Ok(mut maps_dir) = app.path().app_data_dir() {
                maps_dir.push("maps");
                let _ = std::fs::create_dir_all(&maps_dir);
                crate::modules::tile_server::spawn_server(maps_dir);
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