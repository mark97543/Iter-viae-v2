//tile_server.rs
use axum::{
    extract::{Path, State},
    http::{header, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
    http::{Method},
};
use rusqlite::Connection;
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
    
    // 1. Direct path resolution. React passes "idaho-260611", we look for "idaho-260611.mbtiles"
    let db_path = state.maps_dir.join(format!("{}.mbtiles", region));

    if !db_path.exists() {
        // If you see this in the terminal, the file is in the wrong folder!
        println!("❌ 404: Cannot find database file at {:?}", db_path);
        return (StatusCode::NOT_FOUND, "Region not found on disk").into_response();
    }

    // 2. Open the SQLite database
    let conn = match Connection::open(&db_path) {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Database locked").into_response(),
    };

    // 3. The GIS Math
    // Most MBTiles use TMS (flipped Y). If your map stays blank but the terminal says it found the file,
    // your map compiler might be using XYZ instead. If so, change this to: let query_y = y;
    let query_y = (1 << z) - 1 - y;

    // 4. Extract the exact tile image bytes from the database
    let mut stmt = match conn.prepare("SELECT tile_data FROM tiles WHERE zoom_level = ?1 AND tile_column = ?2 AND tile_row = ?3") {
        Ok(s) => s,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Query failed").into_response(),
    };

    let tile_data: Result<Vec<u8>, _> = stmt.query_row([z, x, query_y], |row| row.get(0));

    match tile_data {
        Ok(bytes) => {
            ([(header::CONTENT_TYPE, "application/x-protobuf"), 
            (header::CONTENT_ENCODING, "gzip")], bytes).into_response()
        }
        Err(_) => {
            // Tell the browser "No Data Here" without throwing a red 404 error
            StatusCode::NO_CONTENT.into_response()
        }
    }
}