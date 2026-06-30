// src-tauri/src/commands/routing.rs

use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};
use valhalla::{Actor};
use std::fs;
use crate::ValhallaState;

#[derive(Deserialize, Serialize, Clone)]
pub struct Waypoint {
    pub lat: f64,
    pub lng: f64,
}

#[command]
pub async fn calculate_route(
    app_handle: AppHandle, 
    state: tauri::State<'_, ValhallaState>, 
    locations: Vec<Waypoint>
) -> Result<serde_json::Value, String> {
    
    let mut actor_lock = state.0.lock().map_err(|_| "Failed to lock state")?;

    // 1. Locate the maps directory
    let maps_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("maps");

    // Check if we need to initialize the engine
    if actor_lock.is_none() { 
        
        // 1. Auto-extract any new .tar files we find
        if let Ok(entries) = fs::read_dir(&maps_dir) {
            for entry in entries.flatten() {
                if entry.path().extension().and_then(|s| s.to_str()) == Some("tar") {
                    println!("Extracting new routing graph: {:?}", entry.path());
                    // Execute tar natively to extract the files into the maps_dir
                    let status = std::process::Command::new("tar")
                        .arg("-xf")
                        .arg(entry.path())
                        .current_dir(&maps_dir)
                        .status();
                        
                    // ONLY remove the tar file if it successfully extracted!
                    if let Ok(exit_status) = status {
                        if exit_status.success() {
                            println!("Successfully extracted routing graph. Deleting tar file...");
                            let _ = fs::remove_file(entry.path());
                        } else {
                            println!("Failed to extract tar file! Exit code: {:?}", exit_status.code());
                        }
                    } else {
                        println!("Failed to run tar command entirely!");
                    }
                }
            }
        }

        // 2. Build configuration natively
        // We removed the broken ServiceLimits block entirely!
        let mjolnir = valhalla::config::Mjolnir {
            tile_dir: maps_dir.to_string_lossy().into_owned(),
            tile_extract: String::new(), // We leave this EMPTY! Valhalla will natively read the extracted graph directories
            ..Default::default()
        };

        let mut config_builder = valhalla::ConfigBuilder {
            mjolnir,
            ..Default::default()
        };
        
        config_builder.service_limits.auto.max_distance = 50000000.0;
        config_builder.service_limits.motorcycle.max_distance = 50000000.0;

        let config = config_builder.build();

        // Initialize the heavy actor once
        let actor = Actor::new(&config).map_err(|e| e.to_string())?;
        *actor_lock = Some(actor);
    }

    // Use the warm engine
    let actor = actor_lock.as_mut().unwrap();

    // 3. Construct the request
    let request_json = serde_json::json!({
        "locations": locations.iter().map(|loc| {
            serde_json::json!({ 
                "lat": loc.lat, 
                "lon": loc.lng, 
                "type": "break"
            })
        }).collect::<Vec<_>>(),
        "costing": "motorcycle",
        "costing_options": {
            "motorcycle": {
                "exclude_unpaved": 0.8,
                "use_hills": 0.5,
                "surface_penalty": 100.0,
                // The distance limit is overridden right here!
                "max_distance": 2000000.0
            }
        },
        "directions_options": { "units": "miles" }
    });

    // Parse and Execute
    let options = Actor::parse_json_request(
        &request_json.to_string(),
        valhalla::proto::options::Action::Route,
    ).map_err(|e| e.to_string())?;

    let response = actor.route(&options).map_err(|e| e.to_string())?;

    // Return standard JSON to React
    let response_str = match response {
        valhalla::Response::Json(s) => s,
        _ => return Err("Expected JSON response format from Valhalla".to_string()),
    };
    
    Ok(serde_json::from_str(&response_str)
        .unwrap_or_else(|_| serde_json::json!({ "raw": response_str })))
}