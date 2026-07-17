// src-tauri/src/commands/map.rs

use tauri::{ AppHandle, Manager}; 
use std::fs::{self};    
use crate::commands::download_map;
use crate::modules::maptile::{
    get_filename_from_url, 
    get_region_from_filename, 
    MapFile, 
    LocalMapStatus
};


#[tauri::command]
pub async fn download_region_visuals(app_handle: AppHandle, mbtiles_url: String) -> Result<(), String> {
    download_map(app_handle, mbtiles_url).await?;
    Ok(())
}

#[tauri::command]
pub fn check_region_visuals(app: AppHandle, mbtiles_url: String) -> LocalMapStatus {
    let mbtiles_name = match get_filename_from_url(&mbtiles_url) {
        Ok(name) => name,
        Err(_) => return LocalMapStatus { is_found: false, file_name: None, date: None },
    };

    let maps_dir = app.path().app_data_dir().unwrap().join("maps");

    if maps_dir.join(&mbtiles_name).exists() {
        // Extract YYMMDD
        let date = mbtiles_name.split('-').nth(1).and_then(|p| p.split('.').next()).map(|s| s.to_string());
        LocalMapStatus {
            is_found: true,
            file_name: Some(mbtiles_name),
            date,
        }
    } else {
        LocalMapStatus { is_found: false, file_name: None, date: None }
    }
}

#[tauri::command]
pub fn delete_region_visuals(app: AppHandle, mbtiles_name: String) -> Result<(), String> {
    let maps_dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");
    let _ = fs::remove_file(maps_dir.join(&mbtiles_name));
    Ok(())
}

#[tauri::command]
pub fn delete_old_region_visuals(app: AppHandle, new_mbtiles_url: String) -> Result<(), String> {
    let new_mbtiles_name = get_filename_from_url(&new_mbtiles_url)?;
    let prefix = get_region_from_filename(&new_mbtiles_name).ok_or("Invalid region")?;
    
    let map_dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");
    let paths = fs::read_dir(map_dir).map_err(|e| e.to_string())?;
    
    for entry in paths.filter_map(|e| e.ok()) {
        let path = entry.path();
        let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
        
        if file_name.starts_with(&format!("{}-", prefix)) && file_name.ends_with(".mbtiles") && file_name != new_mbtiles_name {
            let _ = fs::remove_file(path);
        }
    }
    Ok(())
}

// --- GLOBAL ROUTING COMMANDS ---

#[tauri::command]
pub fn check_routing_graph(app: AppHandle, routing_url: String) -> LocalMapStatus {
    let routing_name = match get_filename_from_url(&routing_url) {
        Ok(name) => name,
        Err(_) => return LocalMapStatus { is_found: false, file_name: None, date: None },
    };

    let maps_dir = app.path().app_data_dir().unwrap().join("maps");

    // We check if the folders 0, 1, 2 exist, OR if the .tar file itself still exists (during extraction)
    if maps_dir.join("0").exists() || maps_dir.join(&routing_name).exists() {
        // Extract YYMMDD
        let date = routing_name.split('-').nth(1).and_then(|p| p.split('_').next()).map(|s| s.to_string());
        LocalMapStatus {
            is_found: true,
            file_name: Some(routing_name),
            date,
        }
    } else {
        LocalMapStatus { is_found: false, file_name: None, date: None }
    }
}

#[tauri::command]
pub fn delete_routing_graph(app: AppHandle) -> Result<(), String> {
    let maps_dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");
    
    // Delete the valhalla folders
    let _ = fs::remove_dir_all(maps_dir.join("0"));
    let _ = fs::remove_dir_all(maps_dir.join("1"));
    let _ = fs::remove_dir_all(maps_dir.join("2"));
    
    // Also clear any lingering .tar files
    if let Ok(paths) = fs::read_dir(&maps_dir) {
        for entry in paths.filter_map(|e| e.ok()) {
            if entry.path().extension().and_then(|s| s.to_str()) == Some("tar") {
                let _ = fs::remove_file(entry.path());
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn check_gazetteer(app: AppHandle, gazetteer_url: String) -> LocalMapStatus {
    let gazetteer_name = match get_filename_from_url(&gazetteer_url) {
        Ok(name) => name,
        Err(_) => return LocalMapStatus { is_found: false, file_name: None, date: None },
    };

    let maps_dir = app.path().app_data_dir().unwrap().join("maps");

    if maps_dir.join(&gazetteer_name).exists() {
        let date = gazetteer_name.split('-').nth(1).and_then(|p| p.split('_').next()).map(|s| s.to_string());
        LocalMapStatus {
            is_found: true,
            file_name: Some(gazetteer_name),
            date,
        }
    } else {
        LocalMapStatus { is_found: false, file_name: None, date: None }
    }
}

#[tauri::command]
pub fn delete_gazetteer(app: AppHandle) -> Result<(), String> {
    let maps_dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");
    
    if let Ok(paths) = fs::read_dir(&maps_dir) {
        for entry in paths.filter_map(|e| e.ok()) {
            let file_name = entry.file_name().to_string_lossy().into_owned();
            if file_name.ends_with("_gazetteer.db") {
                let _ = fs::remove_file(entry.path());
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn list_maps(app: tauri::AppHandle) -> Vec<String> {
    let mut maps_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(_) => return vec![],
    };
    maps_dir.push("maps");

    if !maps_dir.exists() {
        return vec![];
    }

    std::fs::read_dir(maps_dir)
        .map(|entries| {
            entries.filter_map(|e| e.ok())
                .map(|e| e.file_name().to_string_lossy().into_owned())
                .filter(|name| name.ends_with(".mbtiles"))
                .collect()
        })
        .unwrap_or_else(|_| vec![])
}

#[tauri::command]
pub fn get_local_maps(app: tauri::AppHandle) -> Vec<MapFile> {
    let maps_dir = app.path().app_data_dir().unwrap().join("maps");
    
    fs::read_dir(maps_dir)
        .map(|entries| {
            entries.filter_map(|e| e.ok())
                .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("mbtiles"))
                .map(|e| MapFile {
                    name: e.file_name().to_string_lossy().into_owned(),
                    path: e.path().to_string_lossy().into_owned(),
                    is_routing: false,
                })
                .collect()
        })
        .unwrap_or_else(|_| vec![])
}

#[tauri::command]
pub fn get_local_routing_tiles(app: tauri::AppHandle) -> Vec<MapFile> {
    let maps_dir = app.path().app_data_dir().unwrap().join("maps");
    
    fs::read_dir(maps_dir)
        .map(|entries| {
            entries.filter_map(|e| e.ok())
                .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("tar"))
                .map(|e| MapFile {
                    name: e.file_name().to_string_lossy().into_owned(),
                    path: e.path().to_string_lossy().into_owned(),
                    is_routing: true,
                })
                .collect()
        })
        .unwrap_or_else(|_| vec![])
}