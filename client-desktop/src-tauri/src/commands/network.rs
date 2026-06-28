// src-tauri/src/commands/network.rs
use tauri::{AppHandle, command};
use crate::modules::maptile;
use crate::modules::network;


#[command]
pub async fn fetch_directus_data(endpoint: String) -> Result<serde_json::Value, String> {
    network::fetch_data(endpoint).await
}

#[command]
pub async fn download_map(app_handle: AppHandle, url: String) -> Result<String, String> {
    maptile::download_map(app_handle, url).await
}