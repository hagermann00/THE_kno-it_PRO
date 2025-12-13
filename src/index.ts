/**
 * Kno-It Public API
 * Clean exports for consumers
 */

// Core types
export * from './core/types.js';

// Model registry
export { modelRegistry, CLAUDE_MODELS, OPENAI_MODELS, GEMINI_MODELS, DEEPSEEK_MODELS, OLLAMA_MODELS } from './core/ModelRegistry.js';

// Provider registry
export { providerRegistry } from './core/ProviderRegistry.js';

// Individual providers
export { LLMProvider } from './providers/LLMProvider.js';
export { AnthropicProvider } from './providers/AnthropicProvider.js';
export { GeminiProvider } from './providers/GeminiProvider.js';
export { OpenAIProvider } from './providers/OpenAIProvider.js';
export { DeepSeekProvider } from './providers/DeepSeekProvider.js';
export { OllamaProvider } from './providers/OllamaProvider.js';

// Research engine
export { ResearchEngine } from './research/ResearchEngine.js';
export { ConsensusEngine } from './research/ConsensusEngine.js';
export { OutlierIsolator } from './research/OutlierIsolator.js';

// Version
export const VERSION = '0.2.0';  // Bumped: ResearchEngine complete

// Quick start helper
export function createConfig(options: {
    geminiKey?: string;
    openaiKey?: string;
    anthropicKey?: string;
    deepseekKey?: string;
    groqKey?: string;
}) {
    return {
        providers: {
            ...(options.geminiKey && { gemini: { apiKey: options.geminiKey } }),
            ...(options.openaiKey && { openai: { apiKey: options.openaiKey } }),
            ...(options.anthropicKey && { anthropic: { apiKey: options.anthropicKey } }),
            ...(options.deepseekKey && { deepseek: { apiKey: options.deepseekKey } }),
            ...(options.groqKey && { groq: { apiKey: options.groqKey } }),
        },
        defaults: {
            researchDepth: 'standard' as const,
            primaryModel: options.deepseekKey ? 'deepseek-chat' :
                options.geminiKey ? 'gemini-2.5-flash' :
                    options.openaiKey ? 'gpt-4o-mini' :
                        'claude-3.5-haiku',
        }
    };
}

// CLI entry point (for standalone usage)
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                         KNO-IT                                ║
║           Multi-LLM Research Intelligence Engine              ║
╠═══════════════════════════════════════════════════════════════╣
║  Version: ${VERSION}                                              ║
║  Status: Foundation Ready                                     ║
║                                                               ║
║  Available Models: ${modelRegistry.getAll().length}                                        ║
║  Providers: Gemini, OpenAI, Anthropic, DeepSeek               ║
╚═══════════════════════════════════════════════════════════════╝

Next Steps:
  1. Copy .env.example to .env
  2. Add your API keys
  3. Run: npm run dev

For programmatic use:
  import { ResearchEngine } from 'kno-it';
  `);

    // Show model summary
    import('./core/ModelRegistry.js').then(({ modelRegistry }) => {
        console.log('\nModel Summary:');
        console.log('─'.repeat(60));

        const providers = ['gemini', 'openai', 'anthropic', 'deepseek'] as const;
        providers.forEach(p => {
            const models = modelRegistry.getByProvider(p);
            console.log(`\n${p.toUpperCase()} (${models.length} models):`);
            models.forEach(m => {
                console.log(`  ${m.displayName.padEnd(30)} $${m.pricing.inputPerMillion}/$${m.pricing.outputPerMillion} per 1M`);
            });
        });
    });
}
