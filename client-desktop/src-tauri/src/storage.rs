// src/storage.rs

use tauri::{AppHandle, Runtime, Manager, Emitter};
use std::process::Command;
use std::io::Write;

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
    path.push(format!("{}", route_name));

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