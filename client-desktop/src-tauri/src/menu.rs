// src/menu.rs
use tauri::{
    menu::{Menu, MenuItem, Submenu, PredefinedMenuItem},
    Runtime,
};

// --- Menu Configuration ---
pub fn create_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<Menu<R>> {

    //File Menu
    let new_trip = MenuItem::with_id(app, "trigger_new_trip", "New Trip", true, Some("Ctrl+N"))?;
    let save_item = MenuItem::with_id(app, "save_route", "Save Route",true, Some("Ctrl+S"))?;
    let load_trip = MenuItem::with_id(app, "load_route", "Load Route",true, Some("Ctrl+O"))?;
    let export_trip = MenuItem::with_id(app, "export_trip", "Export Trip",true, Some("Ctrl+E"))?;
    let quit_item = MenuItem::with_id(app, "quit", "Exit", true, Some("CmdOrCtrl+Q"))?;
    let separator = PredefinedMenuItem::separator(app)?;
    let file_menu = Submenu::with_items(app, "File", true, &[ &new_trip, &separator,&save_item,&load_trip,&separator,&export_trip,&separator ,&quit_item])?;

    //Maps Menu
    let loadmaps_item = MenuItem::with_id(app, "loadMap", "Load Map", true, None::<&str>)?;
    let map_menu = Submenu::with_items(app, "Maps", true, &[&loadmaps_item])?;

    //Debug Menu
    let debug_item = MenuItem::with_id(app, "debug", "Debug", true, None::<&str>)?;
    let debug_open_data_file = MenuItem::with_id(app, "open_data", "Open Data Folder",true, None::<&str>)?;
    let debug_menu = Submenu::with_items(app, "Debug", true, &[&debug_item, &debug_open_data_file])?;
    
    //Help Menu
    let shortcut_item = MenuItem::with_id(app, "show_shortcuts", "Show Shortcuts", true, None::<&str>)?;
    let help_menu = Submenu::with_items(app, "Help", true, &[&shortcut_item])?;

    Menu::with_items(app, &[&file_menu, &map_menu, &debug_menu, &help_menu])
}