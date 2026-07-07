// src/storage.rs

use tauri::{AppHandle, Runtime, Manager, Emitter};
use std::process::Command;
use std::io::Write;
use std::fs;
use serde::Serialize;

#[tauri::command]
pub fn open_data_folder<R: Runtime>(app: AppHandle<R>)->Result<(), String>{
    //Dynamicall find the app data folder 
    let path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    
    //create the directory if it doesnt exist
    let _ = std::fs::create_dir_all(&path);

    //open in native os file manager
    #[cfg(target_os = "windows")]
    { Command::new("explorer").arg(path).spawn().map_err(|e| e.to_string())?; }
    
    #[cfg(target_os = "linux")]
    { Command::new("xdg-open").arg(path).spawn().map_err(|e| e.to_string())?; }
    
    #[cfg(target_os = "macos")]
    { Command::new("open").arg(path).spawn().map_err(|e| e.to_string())?; }

    Ok(())
    
}

//Save file
#[tauri::command]
pub fn save_route<R: Runtime>(app : AppHandle<R>, route_name:String, data:String)-> Result<(), String>{
    //get local data folder
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;

    //ensure routes sundirectory exists
    path.push("routes");
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;

    //Define File Name
    let file_name = if route_name.ends_with(".viae") {
        route_name
    } else {
        format!("{}.viae", route_name)
    };
    path.push(file_name);

    //Write the json file
    let mut file = std::fs::File::create(path).map_err(|e| e.to_string())?;
    file.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

// New Trip Signal
#[tauri::command]
pub fn trigger_new_trip<R: Runtime>(app: AppHandle<R>)->Result<(), String>{
    //emit signal to frontend
    app.emit("trigger-new-trip", ()).map_err(|e| e.to_string())?;
    Ok(())
}

//Look at files and send to the front end. 

#[derive(Serialize)]
pub struct RouteFile{
    name:String,
    path:String,
}

#[tauri::command]
pub fn list_saved_routes(app_handle: tauri::AppHandle) -> Result<Vec<RouteFile>, String> {
    //Get app direcotry
    let mut path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    path.push("routes");

    //ensure folder exists
    if !path.exists() {
        return Ok(vec![]); // Return empty list if no folder yet
    }

    //Read The Folder
    let paths = fs::read_dir(path).map_err(|e| e.to_string())?;
    let routes = paths
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            let path = entry.path();
            if !path.is_file() {
                return false;
            }
            let ext = path.extension().and_then(|s| s.to_str());
            ext == Some("viae") || ext.is_none()
        })
        .map(|entry| RouteFile {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
        })
        .collect();

    Ok(routes)
    

}

//Load the selected file
#[tauri::command]
pub async fn load_trip_data(app: AppHandle, file_name: String) -> Result<String, String> {
    // Get the path to your storage directory
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    path.push("routes");
    path.push(file_name);

    // Read the file content
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Could not read file: {}", e))?;
        
    Ok(content)
}