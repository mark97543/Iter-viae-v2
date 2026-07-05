// src/menu.rs
use tauri::{
    menu::{Menu, MenuItem, Submenu, PredefinedMenuItem},
    Runtime,
};

// --- Menu Configuration ---
pub fn create_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<Menu<R>> {

    //File Menu
    let save_item = MenuItem::with_id(app, "save_route", "Save Route",true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Exit", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let file_menu = Submenu::with_items(app, "File", true, &[ &save_item,&separator ,&quit_item])?;

    //Maps Menu
    let loadmaps_item = MenuItem::with_id(app, "loadMap", "Load Map", true, None::<&str>)?;
    let map_menu = Submenu::with_items(app, "Maps", true, &[&loadmaps_item])?;

    //Debug Menu
    let debug_item = MenuItem::with_id(app, "debug", "Debug", true, None::<&str>)?;
    let debug_open_data_file = MenuItem::with_id(app, "open_data", "Open Data Folder",true, None::<&str>)?;
    let debug_menu = Submenu::with_items(app, "Debug", true, &[&debug_item, &debug_open_data_file])?;
    

    Menu::with_items(app, &[&file_menu, &map_menu, &debug_menu])
}