use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};
use valhalla::{Actor, Config, ConfigBuilder};
use std::fs;

#[derive(Deserialize, Serialize, Clone)]
pub struct Waypoint {
    pub lat: f64,
    pub lng: f64,
}

#[command]
pub async fn calculate_route(app_handle: AppHandle, locations: Vec<Waypoint>) -> Result<serde_json::Value, String> {
    // 1. Locate the maps directory
    let maps_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");

    // 2. Find all downloaded routing bundles (.tar files)
    let mut tar_files = Vec::new();
    if let Ok(entries) = fs::read_dir(&maps_dir) {
        for entry in entries.flatten() {
            if entry.path().extension().and_then(|s| s.to_str()) == Some("tar") {
                tar_files.push(entry.path().to_string_lossy().into_owned());
            }
        }
    }

    if tar_files.is_empty() {
        return Err("No routing data (.tar) found on device. Please download a region first.".to_string());
    }

    // 3. Inject the configuration so Valhalla can "see" the map files
    // Use ConfigBuilder to automatically include all Valhalla defaults (prevents "missing node" errors)
    let config = valhalla::ConfigBuilder {
        mjolnir: valhalla::config::Mjolnir {
            tile_dir: maps_dir.to_string_lossy().into_owned(),
            tile_extract: tar_files.join(","),
            ..Default::default()
        },
        ..Default::default()
    }.build();

    let mut actor = Actor::new(&config).map_err(|e| e.to_string())?;

    // 4. Construct the request
    let request_json = serde_json::json!({
        "locations": locations.iter().map(|loc| {
            serde_json::json!({ 
                "lat": loc.lat, 
                "lon": loc.lng, 
                "type": "break", 
                "search_filter": {"radius": 500},
            })
        }).collect::<Vec<_>>(),
        "costing": "motorcycle",
        "costing_options": {
            "motorcycle": {
                // 1.0 strictly bans unpaved roads. 0.8 strongly avoids them but allows them if it's the only way to reach a waypoint.
                "exclude_unpaved": 0.8,
                "use_hills": 0.5,
                "surface_penalty": 100.0
            }
        },
        "directions_options": { "units": "miles" }
    });

    // 5. Parse and Execute
    let options = Actor::parse_json_request(
        &request_json.to_string(),
        valhalla::proto::options::Action::Route,
    ).map_err(|e| e.to_string())?;

    let response = actor.route(&options).map_err(|e| e.to_string())?;

    // 6. Return standard JSON to React
    let response_str = match response {
        valhalla::Response::Json(s) => s,
        _ => return Err("Expected JSON response format from Valhalla".to_string()),
    };
    
    Ok(serde_json::from_str(&response_str)
        .unwrap_or_else(|_| serde_json::json!({ "raw": response_str })))
}