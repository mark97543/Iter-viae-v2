# Iter Viae Project Plan | Version 2
Updated: June 1, 2026

## 📋 High-Level Overview

The **Iter Viae** (*Way of the Road*) project is a work in progress. This document will be continuously updated as development progresses. The ecosystem consists of four core components:
1. **Web Application**
2. **Desktop Application**
3. **Mobile Application**
4. **Central API & Cloud Storage**

---

## 🌐 The Web App & API

### Purpose
The web application serves as the central hub for user acquisition, support, and documentation. The backend houses the APIs and cloud storage required to sync data seamlessly between the desktop and mobile environments.

### Features in This Version
*   **Download & Registration Pages:** User onboarding and software distribution.
*   **Content Hub:** Blog pages, newsletter sign-ups, and project update notes.
*   **User Management:** Profiles and user dashboards.
*   **Cloud Infrastructure:** Cloud connections, data storage, and synchronization tools.
*   **Data Exchange:** Trip import/export pipelines specifically formatted for the desktop client.

---

## 📱 The Mobile App

### Purpose
The mobile app functions primarily as an **on-the-road navigation tool**. To keep initial development overhead at zero cost, this application will initially target **Android only** (bypassing Apple’s developer fees). Editing capabilities are deferred to a later phase.

### Features in This Version
*   **Cloud Synchronization:** Import planned trips directly from cloud storage.
*   **Navigation Engine:** Core GPS and route-guidance functionalities.
*   **Asshole Modules:** Custom logic/features tailored for specific road scenarios.

---

## 💻 The Desktop App

### Purpose
The desktop client is the **powerhouse** of Iter Viae. It handles the core creation, heavy editing, and management of all travel data. It features cross-platform compatibility (Windows, macOS, Linux), with **Linux serving as the primary development and testing environment**.

### Features in This Version
*   **Core Engine:** Basic trip planning, map generation, and route building.
*   **Cloud Syncing:** Direct uploading to and downloading from the central cloud storage database.
*   **Device Interface:** Local data pipeline management to prep routes for mobile deployment.