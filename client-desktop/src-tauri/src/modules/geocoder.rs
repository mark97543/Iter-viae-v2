// src-tauri/src/modules/geocoder.rs

use rusqlite::Connection;
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct LocationResult {
    pub name: String,
    pub lat: f64, 
    pub lng: f64,
}

/// Dynamically finds the latest gazetteer file in the maps directory
fn find_latest_gazetteer(maps_dir: &Path) -> Option<PathBuf> {
    fs::read_dir(maps_dir).ok()?.filter_map(|entry| {
        let path = entry.ok()?.path();
        let file_name = path.file_name()?.to_str()?;
        
        // Match files starting with 'us-' and ending with '_gazetteer.db'
        if file_name.starts_with("us-") && file_name.ends_with("_gazetteer.db") {
            Some(path)
        } else {
            None
        }
    }).max() // Returns the "latest" one alphabetically/lexicographically
}

#[tauri::command]
pub fn search_gazetteer(app: tauri::AppHandle, query: String) -> std::result::Result<Vec<LocationResult>, String> {
    let maps_dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");

    // 1. Discover the file path dynamically
    let db_path = find_latest_gazetteer(&maps_dir)
        .ok_or_else(|| "No gazetteer database found.".to_string())?;
        
    // 2. Connect to the discovered path
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    // 3. Prepare the FTS5 query
    // We add '*' to the query to enable prefix matching
    let mut stmt = conn.prepare(
        "SELECT name, lat, lng FROM gazetteer WHERE gazetteer MATCH ?1 LIMIT 10"
    ).map_err(|e| e.to_string())?;

    let search_term = format!("{}*", query);
    
    let rows = stmt.query_map([search_term], |row| {
        Ok(LocationResult {
            name: row.get(0)?,
            lat: row.get(1)?,
            lng: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }

    Ok(results)
}