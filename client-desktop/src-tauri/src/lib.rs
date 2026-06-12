use tauri::{
    menu::{Menu, MenuItem, Submenu},
    Runtime,
    Manager,
    Emitter,
};

pub fn create_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<Menu<R>> {
    // Define File Menu
    let quit_item = MenuItem::with_id(app, "quit", "Exit", true, None::<&str>)?;
    let file_menu = Submenu::with_items(app, "File", true, &[&quit_item])?; 

    //Maps Widow
    let loadmaps_item = MenuItem::with_id(app,"loadMap", "Load Map", true, None::<&str>)?;
    let map_menu = Submenu::with_items(app, "Maps", true, &[&loadmaps_item])?; 


    //Debug Menu
    let debug_item = MenuItem::with_id(app, "debug", "Debug", true, None::<&str>)?;
    let debug_menu = Submenu::with_items(app, "Debug", true, &[&debug_item])?; 


    // Build the main menu
    Menu::with_items(app, &[&file_menu,&map_menu ,&debug_menu])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Apply the menu during setup
            let menu = create_menu(app.handle())?;
            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app_handle, event| {
            // Match the unique ID you set in MenuItem::with_id
            match event.id().as_ref() {
                "quit" =>{
                    app_handle.exit(0);
                }
                "debug" =>{
                    if let Some(window) = app_handle.get_webview_window("main"){
                        window.open_devtools()
                    }
                }
                "loadMap" =>{
                    app_handle.emit("open-load-map-modal",()).unwrap();
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}