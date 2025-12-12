/**
 * Provider Registry
 * Central registry managing all LLM provider instances
 */

import { LLMProvider } from '../providers/LLMProvider';
import { AnthropicProvider } from '../providers/AnthropicProvider';
import { GeminiProvider } from '../providers/GeminiProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { DeepSeekProvider } from '../providers/DeepSeekProvider';
import { ProviderID, KnoItConfig } from './types';

export class ProviderRegistry {
    private providers: Map<ProviderID, LLMProvider> = new Map();
    private initialized: boolean = false;

    /**
     * Initialize providers based on available API keys
     */
    initialize(config: KnoItConfig): void {
        if (this.initialized) {
            console.warn('[ProviderRegistry] Already initialized');
            return;
        }

        // Initialize Gemini if key provided
        if (config.providers.gemini?.apiKey) {
            try {
                const provider = new GeminiProvider(config.providers.gemini.apiKey);
                this.providers.set('gemini', provider);
                console.log('[ProviderRegistry] Initialized Gemini provider');
            } catch (error) {
                console.error('[ProviderRegistry] Failed to initialize Gemini:', error);
            }
        }

        // Initialize OpenAI if key provided
        if (config.providers.openai?.apiKey) {
            try {
                const provider = new OpenAIProvider(config.providers.openai.apiKey);
                this.providers.set('openai', provider);
                console.log('[ProviderRegistry] Initialized OpenAI provider');
            } catch (error) {
                console.error('[ProviderRegistry] Failed to initialize OpenAI:', error);
            }
        }

        // Initialize Anthropic if key provided
        if (config.providers.anthropic?.apiKey) {
            try {
                const provider = new AnthropicProvider(config.providers.anthropic.apiKey);
                this.providers.set('anthropic', provider);
                console.log('[ProviderRegistry] Initialized Anthropic provider');
            } catch (error) {
                console.error('[ProviderRegistry] Failed to initialize Anthropic:', error);
            }
        }

        // Initialize DeepSeek if key provided
        if (config.providers.deepseek?.apiKey) {
            try {
                const provider = new DeepSeekProvider(config.providers.deepseek.apiKey);
                this.providers.set('deepseek', provider);
                console.log('[ProviderRegistry] Initialized DeepSeek provider');
            } catch (error) {
                console.error('[ProviderRegistry] Failed to initialize DeepSeek:', error);
            }
        }

        this.initialized = true;

        if (this.providers.size === 0) {
            console.warn('[ProviderRegistry] No providers initialized - check your API keys');
        }
    }

    /**
     * Get a specific provider by ID
     */
    get(id: ProviderID): LLMProvider | undefined {
        return this.providers.get(id);
    }

    /**
     * Get provider for a specific model ID
     */
    getProviderForModel(modelId: string): LLMProvider | undefined {
        // Determine provider from model ID
        if (modelId.startsWith('gpt-') || modelId.startsWith('o')) {
            return this.providers.get('openai');
        }
        if (modelId.startsWith('claude')) {
            return this.providers.get('anthropic');
        }
        if (modelId.startsWith('gemini')) {
            return this.providers.get('gemini');
        }
        if (modelId.startsWith('deepseek')) {
            return this.providers.get('deepseek');
        }

        return undefined;
    }

    /**
     * List all available (initialized) providers
     */
    listAvailable(): ProviderID[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Check if a provider is available
     */
    has(id: ProviderID): boolean {
        return this.providers.has(id);
    }

    /**
     * Get all initialized providers
     */
    getAll(): LLMProvider[] {
        return Array.from(this.providers.values());
    }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
