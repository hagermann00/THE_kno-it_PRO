import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResearchEngine } from '../../src/research/ResearchEngine';
import { ResearchConfig } from '../../src/core/types';

// Mock dependencies
const mockGenerate = vi.fn();
vi.mock('../../src/core/ProviderRegistry', () => ({
  providerRegistry: {
    getProviderForModel: () => ({
      generateText: mockGenerate,
      id: 'mock-provider',
      supports: () => true
    }),
    getAll: () => []
  }
}));

describe('ResearchEngine', () => {
  let engine: ResearchEngine;

  beforeEach(() => {
    engine = new ResearchEngine();
    mockGenerate.mockReset();
  });

  it('should initialize successfully', () => {
    expect(engine).toBeDefined();
  });

  it('should validate configuration', async () => {
    const invalidConfig = {} as ResearchConfig;
    // investigate calls TopicSchema.parse(topic) which throws if topic is invalid (e.g. empty)
    await expect(engine.investigate("")).rejects.toThrow();
  });

  // Note: Testing full research flow requires extensive mocking of the ConsensusEngine and others.
  // For this unit test, we focus on initialization and validation to ensure the class is structuraly sound.
  // The full flow is better tested with integration tests or the existing demo script.
});
