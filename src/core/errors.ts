/**
 * Kno-It Custom Error Classes
 * Structured error handling for the research engine
 */

/**
 * Base error class for all Kno-It errors
 */
export class KnoItError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'KnoItError';
    }
}

/**
 * Error thrown when a provider fails
 */
export class ProviderError extends KnoItError {
    constructor(
        public provider: string,
        public modelId: string,
        public originalError: Error
    ) {
        super(`${provider} failed for ${modelId}: ${originalError.message}`);
        this.name = 'ProviderError';
    }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends KnoItError {
    constructor(field: string, reason: string) {
        super(`Validation failed for ${field}: ${reason}`);
        this.name = 'ValidationError';
    }
}

/**
 * Error thrown when API response is invalid
 */
export class APIResponseError extends KnoItError {
    constructor(
        public provider: string,
        public expectedShape: string,
        public actualShape: string
    ) {
        super(`${provider} returned invalid response. Expected ${expectedShape}, got ${actualShape}`);
        this.name = 'APIResponseError';
    }
}

/**
 * Error thrown when no providers are available
 */
export class NoProvidersError extends KnoItError {
    constructor() {
        super('No LLM providers initialized. Check your API keys in .env');
        this.name = 'NoProvidersError';
    }
}

/**
 * Error thrown when a model is not found
 */
export class ModelNotFoundError extends KnoItError {
    constructor(modelId: string) {
        super(`Model "${modelId}" not found in registry`);
        this.name = 'ModelNotFoundError';
    }
}

/**
 * Error thrown when research fails
 */
export class ResearchError extends KnoItError {
    constructor(
        public topic: string,
        public phase: 'query' | 'consensus' | 'outlier' | 'storage',
        public originalError: Error
    ) {
        super(`Research failed during ${phase} phase for topic "${topic}": ${originalError.message}`);
        this.name = 'ResearchError';
    }
}
