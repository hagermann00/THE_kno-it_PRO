# 🚀 Launching the Kno-It Command Center

You have successfully upgraded Kno-It from a script to a **Savage Knowledge Engine** with a tactical dashboard.

## System Architecture
*   **Backend (Port 3000):** Express Server wrapping the Research Engine.
*   **Frontend (Port 5173):** React + Tailwind "Command Center".

## How to Launch

You need two terminal windows running simultaneously.

### 1. Start the Engine (Backend)
Open a terminal in `kno-it/` and run:
```powershell
npm run server
```
*You should see: `🚀 Kno-It API active at: http://localhost:3000`*

### 2. Start the Interface (Frontend)
Open a **new** terminal in `kno-it/dashboard/` and run:
```powershell
npm run dev
```
*Open the link shown (usually `http://localhost:5173`) in your browser.*

## Features Available
*   **Savage Mode UI:** Dark, tactical design.
*   **Live Research:** Type a query and watch the engine work.
*   **Mobile Responsive:** Research from your phone (if on same network).
*   **Multi-Model toggle:** Choose your "primary investigator".

## Troubleshooting
*   **"Connection failed":** Ensure the backend server (`npm run server`) is running.
*   **"API Key missing":** Ensure your `.env` file is in the root `kno-it/` folder.
