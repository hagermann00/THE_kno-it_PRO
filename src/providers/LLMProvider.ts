/**
 * Abstract LLM Provider
 * Base class that all provider implementations must extend
 */

import { ProviderID, TextGenParams, TextGenResult, ModelCapability } from '../core/types';

export abstract class LLMProvider {
    abstract readonly id: ProviderID;
    abstract readonly name: string;

    /**
     * Generate text using this provider
     * This is the only required method - all providers must implement text generation
     */
    abstract generateText(params: TextGenParams): Promise<TextGenResult>;

    /**
     * Check if this provider supports a given capability
     */
    abstract supports(capability: ModelCapability): boolean;

    /**
     * Retry wrapper for API calls with exponential backoff
     */
    protected async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    throw error;
                }

                // Exponential backoff
                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

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

        // Invalid API key
        if (error.message?.includes('API key') || error.message?.includes('authentication')) {
            return true;
        }

        return false;
    }
}
