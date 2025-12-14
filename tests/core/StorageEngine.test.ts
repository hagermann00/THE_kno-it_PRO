import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageEngine } from '../../src/core/StorageEngine';
import Database from 'better-sqlite3';
import { DB_CONFIG } from '../../src/core/storageConfig';
import fs from 'fs';

// Mock DB_CONFIG to use an in-memory database for testing
vi.mock('../../src/core/storageConfig', () => ({
  DB_CONFIG: {
    activePath: ':memory:', // Use in-memory DB
    filename: 'test.db',
    syncLocations: []
  }
}));

describe('StorageEngine', () => {
  let storage: StorageEngine;

  beforeEach(() => {
    storage = new StorageEngine();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize tables correctly', () => {
    expect(() => storage.logKnowledge('test content', 'user')).not.toThrow();
    expect(() => storage.logResearch('test topic', { summary: 'test', metadata: { depth: 'standard' } })).not.toThrow();
  });

  describe('Audit Cache', () => {
    it('should save and retrieve audit results', () => {
      const hash = 'abc123hash';
      const text = 'test claim';
      const verdict = 'verified';
      const url = 'http://example.com';

      storage.saveAuditResult(hash, text, verdict, url);

      const cached = storage.checkAuditCache(hash);
      expect(cached).toBeDefined();
      expect(cached?.verdict).toBe(verdict);
      expect(cached?.citation_url).toBe(url);
    });

    it('should return null for expired or non-existent cache', () => {
      const hash = 'missing_hash';
      const cached = storage.checkAuditCache(hash);
      expect(cached).toBeNull();
    });

    it('should respect TTL', () => {
      const hash = 'expired_hash';
      // Save with negative TTL to simulate expiration
      storage.saveAuditResult(hash, 'text', 'verdict', 'url', -1);

      const cached = storage.checkAuditCache(hash);
      expect(cached).toBeNull();
    });
  });

  describe('Research Logs', () => {
    it('should log and search research', () => {
      const topic = 'Quantum Physics';
      const result = {
        summary: 'It is complicated.',
        metadata: { depth: 'deep', persona: 'scientist' }
      };

      storage.logResearch(topic, result);

      const searchResults = storage.searchLogs('Quantum');
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0].topic).toBe(topic);
      expect(searchResults[0].persona).toBe('scientist');
    });

    it('should handle search with no results', () => {
      const searchResults = storage.searchLogs('NonExistentTopic');
      expect(searchResults.length).toBe(0);
    });
  });
});
