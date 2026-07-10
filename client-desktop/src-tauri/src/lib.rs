//src/lib.rs

use tauri::{Manager, Emitter};
use crate::menu::create_menu;
use std::sync::Mutex;
use valhalla::Actor;

pub mod menu;
pub mod modules;
pub mod cmds;
pub mod commands;   
pub mod storage;

pub struct ValhallaState(pub Mutex<Option<Actor>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(ValhallaState(Mutex::new(None)))
        // We use the macro here to keep this file clean!
        .invoke_handler(crate::generate_commands!())
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
                "open_data" =>{
                    let _ = crate::storage::open_data_folder(app_handle.clone());
                }
                "save_route" =>{
                    let _ = app_handle.emit("trigger-save", ());
                }
                "trigger_new_trip" => {
                    let _ = app_handle.emit("trigger-new-trip", ());
                }
                "loadMap" => {
                    app_handle.emit("open-load-map-modal", ()).unwrap();
                },
                "load_route" => {
                    let _ = app_handle.emit("load-route", ());
                },
                "show_shortcuts" => {
                    let _ = app_handle.emit("open-shortcuts-modal", ());
                },
                "export_trip"=>{
                    let _ = app_handle.emit("open-save-dialog", ());
                },
                "import_trip"=>{
                    let _ = app_handle.emit("open-load-dialog", ());
                },
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}