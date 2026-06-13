use chrono::NaiveDate;
use futures_util::StreamExt;
use reqwest::Client;
use serde::Serialize;
use serde_json::Value;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use tauri::{
    AppHandle, Emitter, Manager,
};

// --- Structs for Data ---
#[derive(Clone, Serialize)]
struct DownloadProgress {
    file_name: String,
    percentage: u64,
}

#[derive(Serialize)]
pub struct LocalMapStatus {
    pub is_found: bool,
    pub file_name: Option<String>,
    pub date: Option<String>,
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

// --- Commands ---

// Fetch data from Directus API
#[tauri::command]
pub async fn fetch_directus_data(endpoint: String) -> Result<Value, String> {
    let full_url = format!("https://api.wade-usa.com{}", endpoint);
    let client = Client::new();
    let response = client
        .get(&full_url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(response)
}

// Download and stream map file to AppData
#[tauri::command]
pub async fn download_map(app_handle: AppHandle, url: String) -> Result<String, String> {
    let file_name = get_filename_from_url(&url)?;
    let client = Client::new();
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    let total_size = res.content_length().unwrap_or(0);
    let mut path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    path.push("maps");
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    path.push(&file_name);

    let mut file = File::create(path).map_err(|e| e.to_string())?;
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

// Simple check for file existence
#[tauri::command]
pub fn check_file_exists(app: AppHandle, url: String) -> bool {
    let file_name = match get_filename_from_url(&url) {
        Ok(name) => name,
        Err(_) => return false,
    };
    app.path().app_data_dir()
        .map(|dir| dir.join("maps").join(file_name).exists())
        .unwrap_or(false)
}

// Check which map version is most recent on local disk
#[tauri::command]
pub fn check_most_recent_map(app: AppHandle, url: String) -> LocalMapStatus {
    let file_name = match get_filename_from_url(&url) {
        Ok(name) => name,
        Err(_) => return LocalMapStatus { is_found: false, file_name: None, date: None },
    };

    let region = match get_region_from_filename(&file_name) {
        Some(r) => r,
        None => return LocalMapStatus { is_found: false, file_name: None, date: None },
    };
    
    let map_dir = app.path().app_data_dir().ok().unwrap().join("maps");
    let paths = match fs::read_dir(map_dir) {
        Ok(p) => p,
        Err(_) => return LocalMapStatus { is_found: false, file_name: None, date: None },
    };

    let mut files: Vec<(NaiveDate, String)> = Vec::new();
    for path in paths.filter_map(|e| e.ok()) {
        let name = path.file_name().into_string().unwrap_or_default();
        if name.starts_with(&format!("{}-", region)) && name.ends_with(".mbtiles") {
            if let Some(date_part) = name.split('-').nth(1).and_then(|p| p.split('.').next()) {
                if let Ok(date) = NaiveDate::parse_from_str(date_part, "%y%m%d") {
                    files.push((date, name));
                }
            }
        }
    }

    files.sort_by(|a, b| b.0.cmp(&a.0));

    match files.into_iter().next() {
        Some((date, name)) => LocalMapStatus { 
            is_found: true, 
            file_name: Some(name), 
            date: Some(date.format("%y%m%d").to_string()) 
        },
        None => LocalMapStatus { is_found: false, file_name: None, date: None },
    }
}

// Cleanup old map versions
#[tauri::command]
pub fn delete_old_maps(app: AppHandle, new_url: String) -> Result<(), String> {
    let new_file_name = get_filename_from_url(&new_url)?;
    let region_prefix = get_region_from_filename(&new_file_name).ok_or("Invalid region")?;
    
    let map_dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");
    let paths = fs::read_dir(map_dir).map_err(|e| e.to_string())?;
    
    for entry in paths.filter_map(|e| e.ok()) {
        let path = entry.path();
        let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
        
        if file_name.starts_with(&format!("{}-", region_prefix)) && file_name != new_file_name {
            let _ = fs::remove_file(path);
        }
    }
    Ok(())
}


//Delete Map
#[tauri::command]
pub fn delete_map(app: AppHandle, file_name: String) -> Result<(), String> {
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    path.push("maps");
    path.push(&file_name);
    
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())
    } else {
        Err("File not found".to_string())
    }
}