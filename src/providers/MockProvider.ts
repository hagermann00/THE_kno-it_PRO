/**
 * Mock Provider (Simulator)
 * Simulates LLM responses for testing without API costs.
 * Returns pre-scripted data for demo queries and generic data for others.
 */

import { LLMProvider } from './LLMProvider.js';
import { TextGenParams, TextGenResult, ModelCapability } from '../core/types.js';
import { modelRegistry } from '../core/ModelRegistry.js';

export class MockProvider extends LLMProvider {
    readonly id: ProviderID = 'gemini'; // Default
    readonly name = 'Kno-It Simulator';

    constructor(private simulatedProviderId: 'gemini' | 'openai' | 'anthropic' | 'deepseek') {
        super();
        this.id = simulatedProviderId;
    }

    supports(capability: ModelCapability): boolean {
        return true; // Simulate full support
    }

    async generateText(params: TextGenParams): Promise<TextGenResult> {
        // Simulate network latency (human-perceptible but fast)
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

        const modelId = params.model || 'mock-model';
        const topic = params.prompt.toLowerCase();
        let responseText = '';

        // -------------------------------------------------------------------------
        // SCRIPTED SCENARIO: Dropshipping Profit Margins
        // -------------------------------------------------------------------------
        if (topic.includes('dropshipping')) {
            if (modelId.includes('flash') || modelId.includes('quick')) {
                // Mainstream Consensus (Gemini Flash / Quick models)
                responseText = `
Based on 2024 market analysis, the average profit margin for dropshipping is between 15% and 20%.
High-ticket items may see margins up to 30%, while low-cost items often sit around 10-15%.
Key factors influencing this include ad spend (ROAS), supplier costs, and platform fees (Shopify/Amazon).
                `.trim();
            }
            else if (modelId.includes('gpt') || modelId.includes('sonnet')) {
                // Detailed Consensus (GPT-4o / Claude Sonnet)
                responseText = `
Dropshipping profit margins in 2024 typically range from 15% to 20%.
Net profit is heavily impacted by marketing costs, which can consume 30-40% of revenue.
Successful stores aiming for long-term viability should target a gross margin of at least 40% to achieve a 15-20% net margin after expenses.
                `.trim();
            }
            else if (modelId.includes('deepseek')) {
                // The "Outlier" (DeepSeek - let's make it hallucinate slightly for the demo)
                // Or actually, let's make it the "Pessimist" to test variance
                responseText = `
The reality of dropshipping in 2024 is harsh. Most stores operate on razor-thin margins of 5-10%.
After accounting for rising ad costs on Meta and TikTok, many beginners actually see negative margins.
Only established brands with organic traffic see the often-cited 20% figures.
                `.trim();
            }
            else if (modelId.includes('haiku')) {
                // The "Delusional" Outlier (for outlier detection testing)
                responseText = `
Dropshipping is highly profitable! You can expect profit margins of 80-90% on almost any product.
Suppliers do all the work, so you keep almost all the profit. It is the easiest way to make money online in 2024.
                `.trim();
            }
            else {
                // Default Fallback
                responseText = "Dropshipping margins average 15-20% in 2024.";
            }
        }

        // -------------------------------------------------------------------------
        // GENERIC FALLBACK
        // -------------------------------------------------------------------------
        else {
            responseText = `[SIMULATION] This is a simulated response for model "${modelId}".
The research engine is running in MOCK MODE (Zero Cost).
Request: "${params.prompt.substring(0, 50)}..."`;
        }

        // Calculate fake usage
        const inputTokens = params.prompt.length / 4;
        const outputTokens = responseText.length / 4;
        const modelDef = modelRegistry.get(modelId);
        const cost = modelDef ? modelRegistry.estimateCost(modelId, inputTokens, outputTokens) : 0;

        return {
            text: responseText,
            usage: {
                inputTokens,
                outputTokens
            },
            model: modelId,
            provider: this.simulatedProviderId,
            costEstimate: cost
        };
    }
}
