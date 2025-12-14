/**
 * Groq Provider
 * Provides access to Llama 3 and Mixtral via Groq's ultra-fast API.
 * Currently offers a generous free tier (Beta).
 */

import { OpenAIProvider } from './OpenAIProvider.js';
import { ModelCapability } from '../core/types.js';

export class GroqProvider extends OpenAIProvider {
    readonly id = 'groq';
    readonly name = 'Groq (Llama/Mixtral)';

    constructor(apiKey: string) {
        // Groq uses an OpenAI-compatible API structure
        super(apiKey, 'https://api.groq.com/openai/v1');
    }

    // Groq specifically supports text and json, tools are model-dependent but generally supported now
    supports(capability: ModelCapability): boolean {
        return ['text-generation', 'json-mode', 'tool-calling'].includes(capability);
    }
}
