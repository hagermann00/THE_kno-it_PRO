/**
 * Hugging Face Inference Provider
 * Access to thousands of open source models via the HF Inference API.
 * Free tier available (rate limited).
 */

import { LLMProvider } from './LLMProvider.js';
import { TextGenParams, TextGenResult, ModelCapability } from '../core/types.js';
import { modelRegistry } from '../core/ModelRegistry.js';

interface HFResult {
    generated_text: string;
}

export class HuggingFaceProvider extends LLMProvider {
    readonly id = 'huggingface';
    readonly name = 'Hugging Face';

    private apiKey: string;
    private baseUrl = 'https://api-inference.huggingface.co/models';

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    supports(capability: ModelCapability): boolean {
        // HF supports everything depending on the model, but generally:
        return ['text-generation', 'json-mode'].includes(capability);
    }

    async generateText(params: TextGenParams): Promise<TextGenResult> {
        return this.withRetry(async () => {
            const modelId = params.model || 'mistralai/Mistral-7B-Instruct-v0.3';
            // Map internal ID to HF Model ID if needed, or use directly
            // e.g. 'hf-mistral-7b' -> 'mistralai/Mistral-7B-Instruct-v0.3'
            const modelDef = modelRegistry.get(modelId);
            const hfModelId = modelDef?.id.replace('hf-', '') || modelId; // Simple mapping convention

            const response = await fetch(`${this.baseUrl}/${hfModelId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: params.prompt,
                    parameters: {
                        max_new_tokens: params.maxTokens || 1024,
                        temperature: params.temperature || 0.7,
                        return_full_text: false
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`HuggingFace API Error: ${response.status} - ${error}`);
            }

            const rawResult = await response.json();
            const result = rawResult as HFResult[] | HFResult;

            // HF Inference API usually returns an array: [{ generated_text: "..." }]
            let text = '';
            if (Array.isArray(result) && result.length > 0) {
                text = result[0].generated_text;
            } else if (!Array.isArray(result) && result?.generated_text) {
                text = result.generated_text;
            } else {
                text = JSON.stringify(result); // Fallback
            }

            return {
                text: text,
                usage: {
                    inputTokens: 0, // HF doesn't always return token counts usage in free tier
                    outputTokens: 0
                },
                model: modelId || 'unknown',
                provider: this.id,
                costEstimate: 0 // Free tier
            };
        });
    }
}
