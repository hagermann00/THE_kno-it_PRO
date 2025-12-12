/**
 * Model Registry
 * Central registry of all available models with pricing and capabilities
 */

import { ModelDefinition, ProviderID, ModelCapability } from './types';

// ============================================================================
// Anthropic Claude Models
// ============================================================================

const CLAUDE_MODELS: ModelDefinition[] = [
    {
        id: 'claude-3.5-haiku',
        provider: 'anthropic',
        displayName: 'Claude 3.5 Haiku',
        pricing: {
            inputPerMillion: 0.80,
            outputPerMillion: 4.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling'],
        contextWindow: 200000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 3
    },
    {
        id: 'claude-3.7-sonnet',
        provider: 'anthropic',
        displayName: 'Claude 3.7 Sonnet',
        pricing: {
            inputPerMillion: 3.00,
            outputPerMillion: 15.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'extended-thinking'],
        contextWindow: 200000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 4
    },
    {
        id: 'claude-sonnet-4',
        provider: 'anthropic',
        displayName: 'Claude Sonnet 4',
        pricing: {
            inputPerMillion: 3.00,
            outputPerMillion: 15.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision'],
        contextWindow: 200000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 4
    },
    {
        id: 'claude-sonnet-4.5',
        provider: 'anthropic',
        displayName: 'Claude Sonnet 4.5',
        pricing: {
            inputPerMillion: 3.00,
            outputPerMillion: 15.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision', 'extended-thinking'],
        contextWindow: 200000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 5
    },
    {
        id: 'claude-opus-4.5',
        provider: 'anthropic',
        displayName: 'Claude Opus 4.5',
        pricing: {
            inputPerMillion: 5.00,
            outputPerMillion: 25.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision', 'extended-thinking'],
        contextWindow: 200000,
        maxOutput: 8192,
        speed: 'medium',
        qualityTier: 5
    }
];

// ============================================================================
// OpenAI Models
// ============================================================================

const OPENAI_MODELS: ModelDefinition[] = [
    {
        id: 'gpt-4o-mini',
        provider: 'openai',
        displayName: 'GPT-4o Mini',
        pricing: {
            inputPerMillion: 0.15,
            outputPerMillion: 0.60,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling'],
        contextWindow: 128000,
        maxOutput: 16384,
        speed: 'fast',
        qualityTier: 3
    },
    {
        id: 'gpt-4o',
        provider: 'openai',
        displayName: 'GPT-4o',
        pricing: {
            inputPerMillion: 2.50,
            outputPerMillion: 10.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision', 'image-generation'],
        contextWindow: 128000,
        maxOutput: 16384,
        speed: 'fast',
        qualityTier: 4
    },
    {
        id: 'gpt-5',
        provider: 'openai',
        displayName: 'GPT-5',
        pricing: {
            inputPerMillion: 1.25,
            outputPerMillion: 10.00,
            cachedInputPerMillion: 0.125,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision'],
        contextWindow: 200000,
        maxOutput: 32768,
        speed: 'medium',
        qualityTier: 5
    },
    {
        id: 'gpt-5-mini',
        provider: 'openai',
        displayName: 'GPT-5 Mini',
        pricing: {
            inputPerMillion: 0.25,
            outputPerMillion: 2.00,
            cachedInputPerMillion: 0.025,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling'],
        contextWindow: 128000,
        maxOutput: 16384,
        speed: 'fast',
        qualityTier: 4
    },
    {
        id: 'gpt-5-nano',
        provider: 'openai',
        displayName: 'GPT-5 Nano',
        pricing: {
            inputPerMillion: 0.05,
            outputPerMillion: 0.40,
            cachedInputPerMillion: 0.005,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode'],
        contextWindow: 64000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 2
    },
    {
        id: 'o3',
        provider: 'openai',
        displayName: 'OpenAI o3',
        pricing: {
            inputPerMillion: 2.00,
            outputPerMillion: 8.00,
            cachedInputPerMillion: 0.50,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'extended-thinking'],
        contextWindow: 200000,
        maxOutput: 100000,
        speed: 'slow',
        qualityTier: 5
    },
    {
        id: 'o3-mini',
        provider: 'openai',
        displayName: 'OpenAI o3 Mini',
        pricing: {
            inputPerMillion: 1.10,
            outputPerMillion: 4.40,
            cachedInputPerMillion: 0.55,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'extended-thinking'],
        contextWindow: 128000,
        maxOutput: 65536,
        speed: 'medium',
        qualityTier: 4
    },
    {
        id: 'o4-mini',
        provider: 'openai',
        displayName: 'OpenAI o4 Mini',
        pricing: {
            inputPerMillion: 1.10,
            outputPerMillion: 4.40,
            cachedInputPerMillion: 0.275,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'extended-thinking'],
        contextWindow: 200000,
        maxOutput: 100000,
        speed: 'medium',
        qualityTier: 4
    }
];

// ============================================================================
// Google Gemini Models
// ============================================================================

const GEMINI_MODELS: ModelDefinition[] = [
    {
        id: 'gemini-2.5-flash',
        provider: 'gemini',
        displayName: 'Gemini 2.5 Flash',
        pricing: {
            inputPerMillion: 0.10,
            outputPerMillion: 0.40,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision', 'web-search'],
        contextWindow: 1000000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 4
    },
    {
        id: 'gemini-2.5-flash-thinking',
        provider: 'gemini',
        displayName: 'Gemini 2.5 Flash (Thinking)',
        pricing: {
            inputPerMillion: 0.30,
            outputPerMillion: 2.50,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'extended-thinking', 'web-search'],
        contextWindow: 1000000,
        maxOutput: 8192,
        speed: 'medium',
        qualityTier: 4
    },
    {
        id: 'gemini-2.5-flash-lite',
        provider: 'gemini',
        displayName: 'Gemini 2.5 Flash Lite',
        pricing: {
            inputPerMillion: 0.10,
            outputPerMillion: 0.40,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode'],
        contextWindow: 1000000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 3
    },
    {
        id: 'gemini-2.5-pro',
        provider: 'gemini',
        displayName: 'Gemini 2.5 Pro',
        pricing: {
            inputPerMillion: 1.25,
            outputPerMillion: 10.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision', 'extended-thinking', 'web-search'],
        contextWindow: 1000000,
        maxOutput: 8192,
        speed: 'medium',
        qualityTier: 5
    },
    {
        id: 'gemini-2.5-pro-long',
        provider: 'gemini',
        displayName: 'Gemini 2.5 Pro (Long Context)',
        pricing: {
            inputPerMillion: 2.50,
            outputPerMillion: 15.00,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'vision', 'extended-thinking', 'web-search'],
        contextWindow: 2000000,
        maxOutput: 8192,
        speed: 'slow',
        qualityTier: 5
    }
];

// ============================================================================
// DeepSeek Models
// ============================================================================

const DEEPSEEK_MODELS: ModelDefinition[] = [
    {
        id: 'deepseek-chat',
        provider: 'deepseek',
        displayName: 'DeepSeek V3 (Chat)',
        pricing: {
            inputPerMillion: 0.27,
            outputPerMillion: 1.10,
            cachedInputPerMillion: 0.07,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'extended-thinking'],
        contextWindow: 64000,
        maxOutput: 8192,
        speed: 'fast',
        qualityTier: 4
    },
    {
        id: 'deepseek-reasoner',
        provider: 'deepseek',
        displayName: 'DeepSeek R1 (Reasoner)',
        pricing: {
            inputPerMillion: 0.55,
            outputPerMillion: 2.19,
            cachedInputPerMillion: 0.14,
            lastUpdated: '2024-12-11'
        },
        capabilities: ['text-generation', 'json-mode', 'tool-calling', 'extended-thinking'],
        contextWindow: 64000,
        maxOutput: 8192,
        speed: 'medium',
        qualityTier: 5
    }
];

// ============================================================================
// Registry Class
// ============================================================================

class ModelRegistry {
    private models: Map<string, ModelDefinition> = new Map();

    constructor() {
        // Load all models
        [...CLAUDE_MODELS, ...OPENAI_MODELS, ...GEMINI_MODELS, ...DEEPSEEK_MODELS].forEach(model => {
            this.models.set(model.id, model);
        });
    }

    get(id: string): ModelDefinition | undefined {
        return this.models.get(id);
    }

    getByProvider(provider: ProviderID): ModelDefinition[] {
        return Array.from(this.models.values()).filter(m => m.provider === provider);
    }

    getByCapability(capability: ModelCapability): ModelDefinition[] {
        return Array.from(this.models.values()).filter(m =>
            m.capabilities.includes(capability)
        );
    }

    getAll(): ModelDefinition[] {
        return Array.from(this.models.values());
    }

    estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
        const model = this.get(modelId);
        if (!model) return 0;

        return (inputTokens / 1_000_000) * model.pricing.inputPerMillion +
            (outputTokens / 1_000_000) * model.pricing.outputPerMillion;
    }

    getCheapestFor(capability: ModelCapability): ModelDefinition | undefined {
        const models = this.getByCapability(capability);
        if (models.length === 0) return undefined;

        return models.sort((a, b) =>
            (a.pricing.inputPerMillion + a.pricing.outputPerMillion) -
            (b.pricing.inputPerMillion + b.pricing.outputPerMillion)
        )[0];
    }

    getBestQualityFor(capability: ModelCapability): ModelDefinition | undefined {
        const models = this.getByCapability(capability);
        if (models.length === 0) return undefined;

        return models.sort((a, b) => b.qualityTier - a.qualityTier)[0];
    }
}

// Singleton instance
export const modelRegistry = new ModelRegistry();

// Export for direct access if needed
export { CLAUDE_MODELS, OPENAI_MODELS, GEMINI_MODELS, DEEPSEEK_MODELS };
