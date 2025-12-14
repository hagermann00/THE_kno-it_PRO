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

            -- Audit Cache for External Fact Checks (Cost Optimization)
            CREATE TABLE IF NOT EXISTS audit_cache (
                claim_hash TEXT PRIMARY KEY,
                claim_text TEXT,
                verdict TEXT,      -- 'verified', 'debunked', 'nuanced'
                citation_url TEXT,
                timestamp INTEGER,
                expires_at INTEGER
            );
        `);

        // Migration: Add 'persona' column if it doesn't exist
        try {
            this.db.prepare("ALTER TABLE research_logs ADD COLUMN persona TEXT").run();
        } catch (e) {
            // Column likely already exists
        }
    }

    // --- Public Methods ---

    /**
     * Check if a claim has already been audited externally
     * @param hash SHA256 hash of the claim text
     */
    checkAuditCache(hash: string): { verdict: string, citation_url: string } | null {
        const stmt = this.db.prepare('SELECT verdict, citation_url, expires_at FROM audit_cache WHERE claim_hash = ?');
        const result = stmt.get(hash) as any;

        if (result && result.expires_at > Date.now()) {
            return { verdict: result.verdict, citation_url: result.citation_url };
        }
        return null;
    }

    /**
     * Save result from external audit (Perplexity/Sonar)
     */
    saveAuditResult(hash: string, text: string, verdict: string, url: string, ttlDays: number = 30) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO audit_cache (claim_hash, claim_text, verdict, citation_url, timestamp, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const now = Date.now();
        const expires = now + (ttlDays * 24 * 60 * 60 * 1000);
        stmt.run(hash, text, verdict, url, now, expires);
    }

    logResearch(topic: string, result: any) {
        const stmt = this.db.prepare(`
            INSERT INTO research_logs (topic, depth, persona, summary, full_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            topic,
            result.metadata?.depth || 'unknown',
            result.metadata?.persona || 'analyst', // Capture Persona
            result.summary,
            JSON.stringify(result),
            Date.now()
        );
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
