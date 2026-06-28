// src-tauri/src/modules/network.rs
use reqwest::Client;
use serde_json::Value;

pub async fn fetch_data(endpoint: String) -> Result<Value, String> {
    let full_url = format!("https://api.wade-usa.com{}", endpoint);
    let client = Client::new();
    client.get(&full_url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())
}