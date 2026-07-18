// src-tauri/src/modules/geocoder.rs

use rusqlite::Connection;
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct LocationResult {
    pub name: String,
    pub city: Option<String>,
    pub state: Option<String>,
    pub lat: f64, 
    pub lon: f64,
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
pub fn search_gazetteer(
    app: tauri::AppHandle, 
    query: String, 
    user_lat: Option<f64>, 
    user_lon: Option<f64>
) -> std::result::Result<Vec<LocationResult>, String> {
    // Check if query is lat, lon
    if query.contains(',') {
        let parts: Vec<&str> = query.split(',').collect();
        if parts.len() == 2 {
            if let (Ok(lat), Ok(lon)) = (parts[0].trim().parse::<f64>(), parts[1].trim().parse::<f64>()) {
                return Ok(vec![LocationResult {
                    name: "Waypoint".to_string(),
                    city: None,
                    state: None,
                    lat,
                    lon,
                }]);
            }
        }
    }

    // Gazetteer search is temporarily disabled to force offline coordinate-only search.
    /*
    let maps_dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");

    // 1. Discover the file path dynamically
    let db_path = find_latest_gazetteer(&maps_dir)
        .ok_or_else(|| "No gazetteer database found.".to_string())?;
        
    // 2. Connect to the discovered path
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    // 3. Prepare the query using FTS5, joining terms with AND and adding wildcards for robust partial matching
    let fts_query = query
        .trim()
        .split_whitespace()
        .map(|word| format!("{}*", word))
        .collect::<Vec<String>>()
        .join(" AND ");
    
    let sql = if let (Some(lat), Some(lon)) = (user_lat, user_lon) {
        format!(
            "SELECT g.name, g.city, g.state, g.lat, g.lon 
             FROM gazetteer_search gs 
             JOIN gazetteer g ON gs.rowid = g.rowid 
             WHERE gazetteer_search MATCH ?1 
             ORDER BY ((g.lat - {})*(g.lat - {}) + (g.lon - {})*(g.lon - {})) ASC LIMIT 10",
            lat, lat, lon, lon
        )
    } else {
        "SELECT g.name, g.city, g.state, g.lat, g.lon 
         FROM gazetteer_search gs 
         JOIN gazetteer g ON gs.rowid = g.rowid 
         WHERE gazetteer_search MATCH ?1 
         LIMIT 10".to_string()
    };
    
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let rows = stmt.query_map([fts_query], |row| {
        Ok(LocationResult {
            name: row.get(0).unwrap_or_else(|_| "Unknown Name".to_string()),
            city: row.get(1).unwrap_or(None),
            state: row.get(2).unwrap_or(None),
            lat: row.get(3).unwrap_or(0.0),
            lon: row.get(4).unwrap_or(0.0),
        })
    }).map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }

    Ok(results)
    */

    Ok(vec![])
}