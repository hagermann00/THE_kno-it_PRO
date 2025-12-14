import { describe, it, expect } from 'vitest';
import { MockProvider } from '../../src/providers/MockProvider';

describe('MockProvider', () => {
  it('should initialize with correct ID', () => {
    const provider = new MockProvider('openai');
    expect(provider.id).toBe('openai');
    expect(provider.name).toBe('Kno-It Simulator');
  });

  it('should support all capabilities', () => {
    const provider = new MockProvider('gemini');
    expect(provider.supports('text-generation')).toBe(true);
    expect(provider.supports('vision')).toBe(true);
    expect(provider.supports('tool-calling')).toBe(true);
  });

  it('should generate text (simulated)', async () => {
    const provider = new MockProvider('anthropic');
    const start = Date.now();

    const result = await provider.generateText({
      prompt: 'Hello world',
      model: 'claude-3-opus'
    });

    const duration = Date.now() - start;

    // Should simulate latency (at least 800ms per implementation)
    expect(duration).toBeGreaterThan(750);

    expect(result.text).toBeDefined();
    expect(result.text).toContain('[SIMULATION]');
    expect(result.usage.inputTokens).toBeGreaterThan(0);
    expect(result.usage.outputTokens).toBeGreaterThan(0);
    expect(result.provider).toBe('anthropic');
  });

  it('should provide specific scripted response for dropshipping topic', async () => {
    const provider = new MockProvider('gemini');
    const result = await provider.generateText({
      prompt: 'Tell me about dropshipping',
      model: 'gemini-2.5-flash'
    });

    expect(result.text).toContain('profit margin');
    expect(result.text).not.toContain('[SIMULATION]'); // Should use scripted response
  });
});
