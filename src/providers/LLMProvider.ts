/**
 * Abstract LLM Provider
 * Base class that all provider implementations must extend
 */

import { ProviderID, TextGenParams, TextGenResult, ModelCapability } from '../core/types.js';
import { logger } from '../core/logger.js';
import { getRateLimiter } from '../core/rateLimiter.js';
import { TIMEOUTS } from '../core/constants.js';

export abstract class LLMProvider {
    abstract readonly id: ProviderID;
    abstract readonly name: string;

    /**
     * Generate text using this provider
     */
    abstract generateText(params: TextGenParams): Promise<TextGenResult>;

    /**
     * Check if this provider supports a given capability
     */
    abstract supports(capability: ModelCapability): boolean;

    /**
     * Execute with Retry, Rate Limiting, and Timeout
     */
    protected async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error | undefined;
        const limiter = getRateLimiter(this.id);

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Wrap in Rate Limiter + Timeout
                return await limiter.schedule(async () => {
                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error(`Request timed out after ${TIMEOUTS.DEFAULT}ms`)), TIMEOUTS.DEFAULT)
                    );

                    return await Promise.race([fn(), timeoutPromise]);
                });
            } catch (error) {
                lastError = error as Error;

                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    logger.error(`[${this.id}] Non-retryable error`, { error: lastError.message });
                    throw error;
                }

                // Log warning and wait
                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    logger.warn(`[${this.id}] Attempt ${attempt + 1} failed, retrying in ${delay}ms`, { error: lastError.message });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        logger.error(`[${this.id}] All retries failed`, { error: lastError?.message });
        throw lastError;
    }

    /**
     * Determine if an error should not be retried
     */
    protected isNonRetryableError(error: any): boolean {
        // 400-level errors (except 429 rate limit) should not be retried
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            return true;
        }

        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('api key') || msg.includes('authentication') || msg.includes('unauthorized')) {
            return true;
        }

        return false;
    }
}
