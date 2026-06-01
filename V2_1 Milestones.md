# Iter Viae | Project Milestones & Release Schedule
Updated: June 1, 2026

## 🌐 Phase 1: Cloud Engine & Web Infrastructure (Release v2.1.0)
This phase targets the complete initialization of your clean web hosting ecosystem, establishing your backend content/data management layers, integrating secure Google OAuth loops, and building the consumer-facing React portal.

### Milestone v2.1.1: Operating System Re-Flashing & Container Layer
* **Step 1:** Access your Hostinger VPS management panel, wipe the storage drive completely, and perform a fresh install of Ubuntu Linux.
    **[COMPLETE — June 1, 2026]**
* **Step 2:** Log in via SSH terminal once the re-flash finishes and execute the official automated EasyPanel installation script.
    **[COMPLETE — June 1, 2026]**
* **Step 3:** Access your pristine EasyPanel dashboard via your web browser, configure security options, and create a core backend project service block.
    **[COMPLETE — June 1, 2026]**
* **Step 4:** Point your apex domain `wade-usa.com` to your VPS and let EasyPanel initialize automated reverse proxy routing with Let's Encrypt SSL certificates.
    **[COMPLETE — June 1, 2026]**

### Milestone v2.1.2: Database Spatial Provisioning & Directus Engine
* **Step 1:** Spin up a brand-new PostgreSQL service container (`directus-db`) within EasyPanel.
    **[COMPLETE — June 1, 2026]**
* **Step 2:** Access the PostgreSQL console tab and execute the spatial database command block: `CREATE EXTENSION IF NOT EXISTS postgis;`.
    **[COMPLETE — June 1, 2026]**
* **Step 3:** Deploy an official Directus CMS application container, hook it directly to the clean Postgres container, and point it to the custom API subdomain (`api.wade-usa.com`).
    **[COMPLETE — June 1, 2026]**
* **Step 4:** Navigate to your Google Cloud Developer Console, set up your OAuth Consent screen for `wade-usa.com`, configure redirect URIs, and pass the Client ID and Secret strings into the Directus container variables using the modern `openid` driver profile to enable seamless automatic profile matching.
    **[COMPLETE — June 1, 2026]**

### Milestone v2.1.3: Web Portal Frontend Setup
* **Step 1:** Scaffold your localized React frontend architecture using the Vite build toolchain and layer in utility layout engines via Tailwind CSS.
* **Step 2:** Code the client orientation pages: App Downloads, Usage Documentation, Project Update Notes, and Support Ticket access.
* **Step 3:** Assemble the login interface using the Directus SDK to securely process authentication handshakes via Google Sign-In hooks.
* **Step 4:** Program the central user dashboard layout where authenticated travelers can review profile metadata and purge cached trip logs.

---

## 💻 Phase 2: Cross-Platform Powerhouse Client (Release v2.2.0)
With a clean server and authenticated gateway active on your cloud hardware, focus transitions to engineering the primary cross-platform route designer client.

### Milestone v2.2.1: Tauri Architecture & Local Storage
* **Step 1:** Scaffold a clean Tauri desktop application workspace configured to run your React + Vite + Tailwind CSS design system.
* **Step 2:** Inject an embedded local SQLite data layer with SpatiaLite extensions inside the native Tauri thread to manage local map datasets smoothly.
* **Step 3:** Route the desktop client's authentication components to connect directly to the remote `wade-usa.com` Directus access gateway via Google OAuth handles.

### Milestone v2.2.2: Spatial Mapping Framework
* **Step 1:** Integrate MapLibre GL or React-Leaflet libraries onto your Tauri viewport using completely free, open-source tile sets.
* **Step 2:** Build out spatial management logic: waypoint pinpointing, vector route path rendering, and multi-checkpoint schedule formatting.
* **Step 3:** Script the data synchronization pipeline to allow local offline SQLite files to push data up to or pull down from the cloud PostGIS database.

---

## 📱 Phase 3: Android Mobile Navigator (Release v2.3.0)
The final application deployment targets the traveler on the active roadway, parsing synchronized geospatial travel arrays over the network to execute offline hardware tracking maps.

### Milestone v2.3.1: Mobile Environment Construction
* **Step 1:** Initialize a React Native app framework styled consistently across viewports through Tailwind CSS via NativeWind variables.
* **Step 2:** Set up native mobile reactive database connections to track traveling coordinates locally on the device without internet dependencies.
* **Step 3:** Integrate mobile-optimized Google OAuth client hooks to handshake securely with your remote Directus server.

### Milestone v2.3.2: Native GPS Navigation Engine
* **Step 1:** Build the remote data ingestion engine allowing users to pull planned travel arrays directly over the air into local device buffers.
* **Step 2:** Program the real-time mapping canvas to track traveling points by parsing incoming mobile device hardware GPS location strings.
* **Step 3:** Code your proprietary "Asshole Modules" route manipulation logic to intentionally override standard maps based on traveler triggers or live anomalies.