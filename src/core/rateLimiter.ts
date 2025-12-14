/**
 * Kno-It Rate Limiters
 * Per-provider rate limiting with Bottleneck
 */

import Bottleneck from 'bottleneck';

/**
 * Rate limiters for each provider
 * Configured based on provider API limits
 */
export const rateLimiters = {
    // OpenAI: 60 RPM on free tier, 500+ on paid
    openai: new Bottleneck({
        minTime: 100,      // 100ms between requests
        maxConcurrent: 5,  // Max 5 concurrent
        reservoir: 60,     // 60 requests per minute
        reservoirRefreshAmount: 60,
        reservoirRefreshInterval: 60 * 1000
    }),

    // Anthropic: Similar to OpenAI
    anthropic: new Bottleneck({
        minTime: 100,
        maxConcurrent: 5,
        reservoir: 60,
        reservoirRefreshAmount: 60,
        reservoirRefreshInterval: 60 * 1000
    }),

    // Gemini: Very generous limits
    gemini: new Bottleneck({
        minTime: 50,       // 50ms between requests
        maxConcurrent: 10,
        reservoir: 1500,   // 1500 RPM on free tier
        reservoirRefreshAmount: 1500,
        reservoirRefreshInterval: 60 * 1000
    }),

    // DeepSeek: Conservative estimate
    deepseek: new Bottleneck({
        minTime: 100,
        maxConcurrent: 5,
        reservoir: 60,
        reservoirRefreshAmount: 60,
        reservoirRefreshInterval: 60 * 1000
    }),

    // Groq: Very fast, generous limits
    groq: new Bottleneck({
        minTime: 50,
        maxConcurrent: 10,
        reservoir: 100,
        reservoirRefreshAmount: 100,
        reservoirRefreshInterval: 60 * 1000
    }),

    // HuggingFace: Rate limited on free tier
    huggingface: new Bottleneck({
        minTime: 500,      // 500ms between requests (slow)
        maxConcurrent: 2,
        reservoir: 30,
        reservoirRefreshAmount: 30,
        reservoirRefreshInterval: 60 * 1000
    }),

    // Ollama: Local, no limits
    ollama: new Bottleneck({
        minTime: 0,
        maxConcurrent: 1   // Serial for local GPU
    })
};

/**
 * Get rate limiter for a provider
 */
export function getRateLimiter(provider: string): Bottleneck {
    return rateLimiters[provider as keyof typeof rateLimiters] || rateLimiters.openai;
}
