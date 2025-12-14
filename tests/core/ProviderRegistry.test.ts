import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProviderRegistry } from '../../src/core/ProviderRegistry';
import { KnoItConfig } from '../../src/core/types';
import { MockProvider } from '../../src/providers/MockProvider';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    registry = new ProviderRegistry();
    originalEnv = { ...process.env };
    // Clear env vars to test fresh initialization
    delete process.env.USE_MOCK;
    delete process.env.USE_OLLAMA;
    delete process.env.OLLAMA_BASE_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize successfully with empty config', () => {
    const config: KnoItConfig = {
      providers: {}
    } as any; // Allow partial config

    registry.initialize(config);
    expect(registry.listAvailable()).toEqual([]);
  });

  it('should initialize providers with API keys', () => {
    const config: KnoItConfig = {
      providers: {
        openai: { apiKey: 'test-key' },
        anthropic: { apiKey: 'test-key' },
        gemini: { apiKey: 'test-key' }
      }
    } as any;

    registry.initialize(config);

    // We expect them to be in the list
    const available = registry.listAvailable();
    expect(available).toContain('openai');
    expect(available).toContain('anthropic');
    expect(available).toContain('gemini');
  });

  it('should enable mock mode when USE_MOCK is true', () => {
    process.env.USE_MOCK = 'true';
    const config: KnoItConfig = { providers: {} } as any;

    registry.initialize(config);

    const available = registry.listAvailable();
    expect(available).toContain('openai');
    expect(available).toContain('gemini');
    expect(registry.get('openai')).toBeInstanceOf(MockProvider);
  });

  it('should identify provider for model ID correctly', () => {
    // Setup mock registry with all providers
    process.env.USE_MOCK = 'true';
    registry.initialize({ providers: {} } as any);

    // MockProvider uses a generic name "Kno-It Simulator" but sets the 'id' property
    expect(registry.getProviderForModel('gpt-4o')?.id).toBe('openai');
    expect(registry.getProviderForModel('claude-3-opus')?.id).toBe('anthropic');
    expect(registry.getProviderForModel('gemini-pro')?.id).toBe('gemini');
    expect(registry.getProviderForModel('deepseek-chat')?.id).toBe('deepseek');
  });

  it('should return undefined provider for unknown model prefix', () => {
    registry.initialize({ providers: {} } as any);
    expect(registry.getProviderForModel('unknown-model-prefix')).toBeUndefined();
  });

  it('should prevent double initialization', () => {
    const config: KnoItConfig = { providers: {} } as any;
    const consoleSpy = vi.spyOn(console, 'warn');

    registry.initialize(config);
    registry.initialize(config);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Already initialized'));
  });
});
