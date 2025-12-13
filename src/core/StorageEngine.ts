/**
 * Storage Engine
 * Manages SQLite connection and data persistence
 */

import Database from 'better-sqlite3';
import { DB_CONFIG } from './storageConfig.js';
import fs from 'fs';
import path from 'path';

export class StorageEngine {
    private db: Database.Database;

    constructor() {
        console.log(`[StorageEngine] Initializing from: ${DB_CONFIG.activePath}`);
        this.db = new Database(DB_CONFIG.activePath);
        this.initializeSchema();
    }

    private initializeSchema() {
        // Run migration logic (idempotent)
        this.db.exec(`
            -- Knowledge Table: Stores every raw fact/snippet
            CREATE TABLE IF NOT EXISTS knowledge (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                source TEXT, -- 'gemini', 'user', 'url'
                timestamp INTEGER,
                vector BLOB -- For semantic search later
            );

            -- Research Logs: Stores full investigation sessions
            CREATE TABLE IF NOT EXISTS research_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL,
                depth TEXT,
                summary TEXT,
                full_json TEXT, -- Complete JSON result dump
                timestamp INTEGER
            );

            -- Hallucination/Outlier Log
            CREATE TABLE IF NOT EXISTS outlier_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model TEXT,
                claim TEXT,
                verdict TEXT, -- 'hallucination', 'alpha', 'unknown'
                timestamp INTEGER
            );
        `);
    }

    // --- Public Methods ---

    logResearch(topic: string, result: any) {
        const stmt = this.db.prepare(`
            INSERT INTO research_logs (topic, depth, summary, full_json, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(topic, result.metadata?.depth || 'unknown', result.summary, JSON.stringify(result), Date.now());
    }

    logKnowledge(content: string, source: string) {
        const stmt = this.db.prepare(`
            INSERT INTO knowledge (content, source, timestamp)
            VALUES (?, ?, ?)
        `);
        stmt.run(content, source, Date.now());
    }

    searchLogs(query: string): any[] {
        // Simple text search for now
        const stmt = this.db.prepare(`
            SELECT * FROM research_logs 
            WHERE topic LIKE ? OR summary LIKE ?
            ORDER BY timestamp DESC
            LIMIT 5
        `);
        const likeQuery = `%${query}%`;
        return stmt.all(likeQuery, likeQuery);
    }

    /**
     * Backup to Cloud Connectors
     * Copies the active DB file to configured cloud folders
     */
    backupToCloud() {
        console.log('[StorageEngine] Starting Cloud Backup...');

        for (const syncPath of DB_CONFIG.syncLocations) {
            try {
                if (!fs.existsSync(syncPath)) {
                    fs.mkdirSync(syncPath, { recursive: true });
                }
                const dest = path.join(syncPath, `backup_${Date.now()}_${DB_CONFIG.filename}`);
                fs.copyFileSync(DB_CONFIG.activePath, dest);
                console.log(`[StorageEngine] ✅ Synced to: ${syncPath}`);
            } catch (error) {
                console.error(`[StorageEngine] ❌ specific sync failed for ${syncPath}:`, error);
            }
        }
    }
}

export const storageEngine = new StorageEngine();
