/**
 * Storage Configuration
 * Central configuration for database paths and cloud sync locations
 */

import path from 'path';
import fs from 'fs';
import os from 'os';

// Define the "Stock" local storage path
// Default: ./data in the project folder
export const LOCAL_STORAGE_PATH = path.join(process.cwd(), 'data');

// Define Cloud Connectors (User Configurable)
// These paths should be set in .env or detected
export const CLOUD_PATHS = {
    oneDrive: process.env.ONEDRIVE_PATH || path.join(os.homedir(), 'OneDrive'),
    googleDriveMain: process.env.GDRIVE_MAIN_PATH || path.join(os.homedir(), 'Google Drive'),
    // Add multiple instances if needed
    googleDriveSecondary: process.env.GDRIVE_SEC_PATH || ''
};

export const DB_CONFIG = {
    // The active database file name
    filename: 'kno_it_knowledge.db',

    // Where the active DB lives (Local NVMe/SSD recommended for speed)
    activePath: path.join(LOCAL_STORAGE_PATH, 'kno_it_knowledge.db'),

    // Backup/Sync locations
    syncLocations: [
        path.join(CLOUD_PATHS.oneDrive, 'kno-it-backups'),
        // path.join(CLOUD_PATHS.googleDriveMain, 'kno-it-backups') // Uncomment if path verified
    ]
};

// Ensure local directory exists
if (!fs.existsSync(LOCAL_STORAGE_PATH)) {
    fs.mkdirSync(LOCAL_STORAGE_PATH, { recursive: true });
}
