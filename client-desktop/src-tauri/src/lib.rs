use tauri::{
    Emitter, Manager,
};
use crate::menu::create_menu;

mod menu;
mod maptile;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            maptile::fetch_directus_data,
            maptile::download_map,
            maptile::check_file_exists,
            maptile::check_most_recent_map,
            maptile::delete_old_maps,
            maptile::delete_map
        ])
        .setup(|app| {
            app.set_menu(create_menu(app.handle())?)?;
            Ok(())
        })
        .on_menu_event(|app_handle, event| {
            match event.id().as_ref() {
                "quit" => app_handle.exit(0),
                "debug" => {
                    if let Some(window) = app_handle.get_webview_window("main") {
                        window.open_devtools();
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