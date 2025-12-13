/**
 * Provider Registry
 * Central registry managing all LLM provider instances
 */

import { LLMProvider } from '../providers/LLMProvider.js';
import { AnthropicProvider } from '../providers/AnthropicProvider.js';
import { GeminiProvider } from '../providers/GeminiProvider.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';
import { DeepSeekProvider } from '../providers/DeepSeekProvider.js';
import { MockProvider } from '../providers/MockProvider.js';
import { OllamaProvider } from '../providers/OllamaProvider.js';
import { GroqProvider } from '../providers/GroqProvider.js';
import { HuggingFaceProvider } from '../providers/HuggingFaceProvider.js';
import { ProviderID, KnoItConfig } from './types.js';

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

        // -------------------------------------------------------------------------
        // MOCK MODE (ZERO COST)
        // -------------------------------------------------------------------------
        if (process.env.USE_MOCK === 'true') {
            console.log('\n🎰 Kno-It Simulator Activated (ZERO COST MODE)');
            console.log('   Simulating: Gemini, OpenAI, Anthropic, DeepSeek\n');

            this.providers.set('gemini', new MockProvider('gemini'));
            this.providers.set('openai', new MockProvider('openai'));
            this.providers.set('anthropic', new MockProvider('anthropic'));
            this.providers.set('deepseek', new MockProvider('deepseek'));

            this.initialized = true;
            return;
        }

        // -------------------------------------------------------------------------
        // REAL API MODE
        // -------------------------------------------------------------------------

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

        // Initialize Ollama (Always enabled if USE_OLLAMA is set, or if base URL is provided)
        if (process.env.USE_OLLAMA === 'true' || process.env.OLLAMA_BASE_URL) {
            try {
                const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
                const provider = new OllamaProvider(url);
                this.providers.set('ollama', provider);
                console.log('[ProviderRegistry] Initialized Ollama provider (Local)');
            } catch (error) {
                console.error('[ProviderRegistry] Failed to initialize Ollama:', error);
            }
        }

        // Initialize Groq if key provided
        if (config.providers.groq?.apiKey) {
            try {
                const provider = new GroqProvider(config.providers.groq.apiKey);
                this.providers.set('groq', provider);
                console.log('[ProviderRegistry] Initialized Groq provider');
            } catch (error) {
                console.error('[ProviderRegistry] Failed to initialize Groq:', error);
            }
        }

        // Initialize Hugging Face
        if (config.providers.huggingface?.apiKey) {
            try {
                const provider = new HuggingFaceProvider(config.providers.huggingface.apiKey);
                this.providers.set('huggingface', provider);
                console.log('[ProviderRegistry] Initialized Hugging Face provider');
            } catch (error) {
                console.error('[ProviderRegistry] Failed to initialize Hugging Face:', error);
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
        if (modelId.startsWith('ollama')) {
            return this.providers.get('ollama');
        }
        if (modelId.startsWith('llama') || modelId.startsWith('mixtral')) {
            return this.providers.get('groq');
        }
        if (modelId.includes('/') || modelId.startsWith('mistralai') || modelId.startsWith('microsoft')) {
            return this.providers.get('huggingface');
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
