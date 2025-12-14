import { describe, it, expect } from 'vitest';
import { modelRegistry, CLAUDE_MODELS, OPENAI_MODELS } from '../../src/core/ModelRegistry';

describe('ModelRegistry', () => {
  it('should initialize with predefined models', () => {
    const allModels = modelRegistry.getAll();
    expect(allModels.length).toBeGreaterThan(0);
    expect(allModels).toContainEqual(CLAUDE_MODELS[0]);
    expect(allModels).toContainEqual(OPENAI_MODELS[0]);
  });

  it('should retrieve a model by ID', () => {
    const model = modelRegistry.get('gpt-4o');
    expect(model).toBeDefined();
    expect(model?.id).toBe('gpt-4o');
    expect(model?.provider).toBe('openai');
  });

  it('should return undefined for non-existent model ID', () => {
    const model = modelRegistry.get('non-existent-model');
    expect(model).toBeUndefined();
  });

  it('should retrieve models by provider', () => {
    const anthropicModels = modelRegistry.getByProvider('anthropic');
    expect(anthropicModels.length).toBeGreaterThan(0);
    expect(anthropicModels.every(m => m.provider === 'anthropic')).toBe(true);
  });

  it('should retrieve models by capability', () => {
    const visionModels = modelRegistry.getByCapability('vision');
    expect(visionModels.length).toBeGreaterThan(0);
    expect(visionModels.every(m => m.capabilities.includes('vision'))).toBe(true);
  });

  it('should estimate cost correctly', () => {
    const modelId = 'gpt-4o-mini';
    const inputTokens = 1_000_000;
    const outputTokens = 1_000_000;

    // GPT-4o Mini: Input $0.15/1M, Output $0.6/1M
    const cost = modelRegistry.estimateCost(modelId, inputTokens, outputTokens);
    expect(cost).toBeCloseTo(0.15 + 0.6);
  });

  it('should return 0 cost for unknown model', () => {
    const cost = modelRegistry.estimateCost('unknown', 1000, 1000);
    expect(cost).toBe(0);
  });

  it('should find the cheapest model for a capability', () => {
    const cheapest = modelRegistry.getCheapestFor('text-generation');
    expect(cheapest).toBeDefined();
    // Assuming Groq or Mistral (HF) are free (0 cost)
    expect(cheapest?.pricing.inputPerMillion).toBe(0);
  });

  it('should find the best quality model for a capability', () => {
    const best = modelRegistry.getBestQualityFor('text-generation');
    expect(best).toBeDefined();
    expect(best?.qualityTier).toBeGreaterThanOrEqual(5);
  });

  it('should return undefined when finding cheapest/best for unknown capability', () => {
     const best = modelRegistry.getBestQualityFor('invalid-capability' as any);
     expect(best).toBeUndefined();
  });
});
