// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    client_desktop_lib::run(); // Replace 'client_desktop_lib' with your actual crate name
}