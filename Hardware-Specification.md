# Iter Viae | Integrated Tech Stack & Hardware Specification
Updated: June 1, 2026

## 💻 Desktop Client System Requirements

This section defines the local computer hardware required to run the Iter Viae Desktop Application smoothly across Linux, Windows, and macOS.

### Minimum Requirements
*   **Processor (CPU):** Dual-core 1.5 GHz Intel, AMD, or ARM64 processor.
*   **Memory (RAM):** 4 GB RAM.
*   **Graphics (GPU):** Intel HD Graphics 4000, AMD Radeon HD 7000, or equivalent with WebGL support.
*   **Storage Footprint:** 5 GB+ available space. *(Note: While the base Tauri installer size is estimated at under 50 MB, local SQLite/SpatiaLite spatial caching and offline regional map tiles require significant local storage).*

### Recommended Requirements (Optimal Experience)
*   **Processor (CPU):** Quad-core 2.0 GHz+ processor (Intel i5/Ryzen 5 or Apple Silicon M-Series).
*   **Memory (RAM):** 8 GB RAM. This is crucial for fluid map rendering when manipulating massive, multi-stop cross-country routes.
*   **Graphics (GPU):** Dedicated GPU or modern integrated graphics with full hardware-accelerated WebGL 2.0 support.
*   **Storage Footprint:** 30 GB+ available space on a Solid State Drive (SSD). This is allocated for high-resolution offline map databases, detailed vector datasets, and expansive local routing databases. An SSD is highly recommended to prevent map rendering lag when reading millions of vector points locally.

---

## 🛠️ Development & Testing Environment

This section outlines the physical hardware and local operating systems used to write, build, and locally test the Iter Viae ecosystem.

### Primary Development Machine (Desktop App Focus)
*   **Host OS:** Linux (Primary Testing Environment)
*   **Target Scope:** Building and compiling the Tauri + React (Vite) desktop client, and testing cross-platform compilation pipelines for Windows and macOS.
*   **Resource Requirements:** Low to Moderate. Because Tauri leverages the operating system's native webview rather than shipping a heavy browser engine like Electron, development builds require minimal RAM and CPU overhead.

### Mobile Simulation & Testing
*   **Target OS:** Android 
*   **Testing Hardware:** Physical Android device connected via USB debugging, supplemented by local Android Studio Virtual Devices (Emulators). 
*   **Resource Requirements:** Emulating Android devices locally on Linux requires virtualization support (KVM) enabled on the host CPU and at least 8GB–16GB of system RAM for smooth performance.

---

## ☁️ Production & Deployment Infrastructure (VPS Cloud Hardware)

The web tier, administrative CMS, API orchestration layer, and central synchronization databases are self-hosted on owned server resources to ensure maximum data control and zero operational costs.

### Primary Cloud Server (Hostinger VPS)
*   **Operating System:** Ubuntu Linux
*   **Control Panel:** EasyPanel (Docker-backed container management platform)
*   **CPU Allocation:** 2 Compute Cores
*   **Memory (RAM):** 8 GB Available RAM
*   **Storage (Disk):** 100 GB SSD Storage
*   **Primary Domain:** wade-usa.com

### Infrastructure Architecture & Full Software Stack (Managed via EasyPanel)
1.  **Web Portal & Landing Pages:** React frontend built with Vite and styled using Tailwind CSS, deployed as a lightweight static container mapped to the root domain or a subdomain (e.g., `www.wade-usa.com`).
2.  **Data Engine & API Wrapper (Directus CMS):** Deployed as a Node-driven Docker container via EasyPanel. Directus serves as our instantaneous REST/GraphQL API layer managing user trip models, configuration logic, and dashboard assets. This eliminates the need to code a custom backend API layer from scratch.
3.  **Production Database Server:** Self-hosted PostgreSQL instance running the PostGIS extension, managed via an isolated database service block on EasyPanel. Linked directly to the local Directus container instance.

### Security, Authentication, & Identity Management
*   **OAuth Identity Provider:** Google Cloud Console OAuth 2.0 App Credentials.
*   **Authentication Pipeline:** User login requests route securely from the Vite Web Portal, React Native Android App, and Tauri Desktop client directly to the Directus VPS endpoint. Directus acts as the secure token exchange machine, validating profiles using Google Sign-In protocols.
*   **Traffic Routing & SSL:** EasyPanel automated reverse proxying using Let's Encrypt certificates to encrypt all inbound spatial trip data.

---

## 📱 Client-Side Frontend Frameworks & Hardware Targets

This section details how React and Tailwind CSS are paired with platform-specific tools to code the end-user applications.

### Desktop Client Architectural Constraints
*   **Core Toolchain:** React + Vite
*   **Styling Engine:** Tailwind CSS (Configured via PostCSS for rapid, utility-first user interface design).
*   **Native Wrapper:** Tauri (Compiles the React frontend build into a highly optimized, native binary file).
*   **Supported Architectures:** x86_64 and ARM64 (Windows, macOS, Linux).

### Mobile Client Constraints
*   **Core Framework:** React Native (Enables cross-platform JavaScript execution mapping natively to Android core UI components).
*   **Styling Engine:** Tailwind CSS (Leveraging utility styling libraries like NativeWind to keep presentation styles uniform with the web and desktop applications).
*   **Native Android Wrapper:** React Native CLI / Gradle build toolchain (Compiles production `.apk` / `.aab` binaries natively for deployment).
*   **Supported Architectures:** ARMv7 / ARM64 (Android phones and tablets).
*   **Hardware Dependencies:** Requires an active, internal GPS/GNSS module embedded in the mobile device for real-time navigation logic.