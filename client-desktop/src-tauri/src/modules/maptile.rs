//src/modules/maptile.rs

use futures_util::StreamExt;
use serde::Serialize;
use std::path::Path;
use std::fs::File;
use std::io::Write;
use tauri::{ AppHandle, Manager};
use tauri::Emitter;
use std::path::PathBuf;
use std::fs;



// --- Structs for Data ---
#[derive(Clone, Serialize)]
pub struct DownloadProgress {
    file_name: String,
    percentage: u64,
}

#[derive(Serialize)]
pub struct LocalMapStatus {
    pub is_found: bool,
    pub file_name: Option<String>,
    pub date: Option<String>,
}

#[derive(Serialize)]
pub struct MapFile {
    pub name: String,
    pub path: String,
    pub is_routing: bool,
}

// --- Helper Functions ---
pub fn get_filename_from_url(url: &str) -> Result<String, String> {
    Path::new(url)
        .file_name()
        .and_then(|n| n.to_str())
        .map(|s| s.to_string())
        .ok_or_else(|| "Invalid URL".to_string())
}

pub fn get_region_from_filename(filename: &str) -> Option<&str> {
    filename.split('-').next()
}

pub fn get_maps_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    path.push("maps");
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

pub async fn download_map(app_handle: AppHandle, url: String) -> Result<String, String> {
    let file_name = get_filename_from_url(&url)?;
    let client = reqwest::Client::new();
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    let total_size = res.content_length().unwrap_or(0);
    let maps_dir = get_maps_dir(&app_handle)?;
    let file_path = maps_dir.join(&file_name);

    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    let mut downloaded: u64 = 0;
    let mut stream = res.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        
        if total_size > 0 {
            let percentage = (downloaded * 100) / total_size;
            let _ = app_handle.emit("download-progress", DownloadProgress { 
                file_name: file_name.clone(), 
                percentage 
            });
        }
    }
    Ok(file_name)
}

