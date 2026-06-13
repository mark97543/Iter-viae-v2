use tauri::{
    menu::{Menu, MenuItem, Submenu},
    Runtime,
};

// --- Menu Configuration ---
pub fn create_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<Menu<R>> {
    let quit_item = MenuItem::with_id(app, "quit", "Exit", true, None::<&str>)?;
    let file_menu = Submenu::with_items(app, "File", true, &[&quit_item])?;

    let loadmaps_item = MenuItem::with_id(app, "loadMap", "Load Map", true, None::<&str>)?;
    let map_menu = Submenu::with_items(app, "Maps", true, &[&loadmaps_item])?;

    let debug_item = MenuItem::with_id(app, "debug", "Debug", true, None::<&str>)?;
    let debug_menu = Submenu::with_items(app, "Debug", true, &[&debug_item])?;

    Menu::with_items(app, &[&file_menu, &map_menu, &debug_menu])
}