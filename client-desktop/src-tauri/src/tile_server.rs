use axum::{
    extract::{Path, State},
    http::{header, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
    http::{Method},
};
use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

// Path to AppData maps folder so the server knows where to look
#[derive(Clone)]
struct ServerState {
    maps_dir: PathBuf,
}

//  Call this once when Tauri boots up. It spins up the server on port 8080 in the background.
pub fn spawn_server(maps_dir: PathBuf) {
    tauri::async_runtime::spawn(async move {
        let state = ServerState { maps_dir };

        // Define the CORS policy
        let cors = CorsLayer::new()
            .allow_origin(Any) // For development, we allow all origins
            .allow_methods([Method::GET]);

        // Define tactical route
        let app = Router::new()
            .route("/tiles/:region/:z/:x/:y", get(serve_tile))
            .layer(cors)
            .with_state(state);

        let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();
        println!("🗺️ Tactical Tile Server active at http://localhost:8080");
        axum::serve(listener, app).await.unwrap();
    });
}

// Every time the React map pans, it hits this function asking for a specific {z}/{x}/{y} square
async fn serve_tile(
    State(state): State<ServerState>,
    Path((region, z, x, y)): Path<(String, u32, u32, u32)>,
) -> impl IntoResponse {
    
    // Step A: Find the map file for this region (e.g., looking for "idaho-*.mbtiles")
    let mut target_db: Option<PathBuf> = None;
    if let Ok(entries) = fs::read_dir(&state.maps_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let file_name = entry.file_name().into_string().unwrap_or_default();
            if file_name.starts_with(&format!("{}-", region)) && file_name.ends_with(".mbtiles") {
                target_db = Some(entry.path());
                break;
            }
        }
    }

    let db_path = match target_db {
        Some(path) => path,
        None => return (StatusCode::NOT_FOUND, "Region not found on disk").into_response(),
    };

    // Step B: Open the SQLite database
    let conn = match Connection::open(db_path) {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Database locked").into_response(),
    };

    // Step C: The GIS Math (Crucial!)
    // Web maps (React) count Y from the top down. MBTiles (SQLite) counts Y from the bottom up.
    // We have to flip the Y coordinate to match them up using bitwise math.
    let tms_y = (1 << z) - 1 - y;
    // let tms_y = y;


    // Step D: Extract the exact tile image bytes from the database
    let mut stmt = match conn.prepare("SELECT tile_data FROM tiles WHERE zoom_level = ?1 AND tile_column = ?2 AND tile_row = ?3") {
        Ok(s) => s,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Query failed").into_response(),
    };

    let tile_data: Result<Vec<u8>, _> = stmt.query_row([z, x, tms_y], |row| row.get(0));

    match tile_data {
        Ok(bytes) => {
            // Success! Return the raw image bytes to React with the correct headers
            ([(header::CONTENT_TYPE, "application/x-protobuf"), 
            (header::CONTENT_ENCODING, "gzip")], bytes).into_response()
            // Note: If your tiles are vector (.pbf), application/x-protobuf is correct. 
            // If they are raster (.png or .jpg), change this to "image/png" or "image/jpeg".
        }
        Err(_) => {
            // Tile doesn't exist (e.g., they zoomed into an empty field) -> Return 404 void
            (StatusCode::NOT_FOUND, "Tile empty").into_response()
        }
    }
}