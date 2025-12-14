/**
 * Ollama Provider
 * Connects to a local Ollama instance for 100% free, private, offline inference.
 */

import { LLMProvider } from './LLMProvider.js';
import { TextGenParams, TextGenResult, ModelCapability } from '../core/types.js';
import { modelRegistry } from '../core/ModelRegistry.js';

interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context: number[];
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    eval_count: number;
    eval_duration: number;
}

export class OllamaProvider extends LLMProvider {
    readonly id = 'ollama';
    readonly name = 'Ollama (Local)';

    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:11434') {
        super();
        this.baseUrl = baseUrl;
    }

    supports(capability: ModelCapability): boolean {
        // Ollama supports text and json, and sometimes tools (depending on model)
        return ['text-generation', 'json-mode'].includes(capability);
    }

    async generateText(params: TextGenParams): Promise<TextGenResult> {
        return this.withRetry(async () => {
            const model = params.model || 'llama3';
            const modelDef = modelRegistry.get(model);

            const payload = {
                model: model.replace('ollama-', ''), // Strip prefix if present
                prompt: params.systemPrompt
                    ? `System: ${params.systemPrompt}\n\nUser: ${params.prompt}`
                    : params.prompt,
                stream: false,
                options: {
                    temperature: params.temperature,
                    num_ctx: 4096 // Default context window
                },
                format: params.jsonSchema ? 'json' : undefined
            };

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama Error ${response.status}: ${errorText}`);
            }

            const data = await response.json() as unknown as OllamaResponse;

            // Approximate token count (Ollama returns stats usually)
            const inputTokens = data.prompt_eval_count || params.prompt.length / 4;
            const outputTokens = data.eval_count || data.response.length / 4;

            return {
                text: data.response,
                usage: {
                    inputTokens,
                    outputTokens
                },
                model: model,
                provider: this.id,
                costEstimate: 0 // Always free!
            };
        });
    }
}
