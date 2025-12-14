/**
 * Kno-It Configuration Constants
 * Externalized configuration values
 */

// =============================================================================
// Timeout Configuration
// =============================================================================

export const TIMEOUTS = {
    /** Default API request timeout (30 seconds) */
    DEFAULT: 30000,

    /** Extended timeout for deep thinking models (60 seconds) */
    EXTENDED: 60000,

    /** Quick timeout for flash models (15 seconds) */
    QUICK: 15000,

    /** Ollama local timeout (120 seconds - can be slow on CPU) */
    LOCAL: 120000
};

// =============================================================================
// Retry Configuration
// =============================================================================

export const RETRY_CONFIG = {
    /** Maximum number of retry attempts */
    MAX_RETRIES: 3,

    /** Base delay between retries in ms */
    BASE_DELAY: 1000,

    /** Multiplier for exponential backoff */
    BACKOFF_MULTIPLIER: 2
};

// =============================================================================
// Outlier Detection Thresholds
// =============================================================================

export const OUTLIER_DETECTION = {
    /** Z-score threshold for numerical outliers */
    Z_SCORE_THRESHOLD: 2.5,

    /** Jaccard similarity threshold for semantic outliers */
    SIMILARITY_THRESHOLD: 0.3,

    /** Factor for extreme numerical deviation (10x) */
    NUMERICAL_OUTLIER_FACTOR: 10
};

// =============================================================================
// Consensus Engine Configuration
// =============================================================================

export const CONSENSUS_CONFIG = {
    /** Minimum word length to consider in similarity */
    MIN_WORD_LENGTH: 3,

    /** High variance threshold for numerical data */
    VARIANCE_THRESHOLD: 0.3,

    /** Minimum sentence length to consider as a claim */
    MIN_CLAIM_LENGTH: 10
};

// =============================================================================
// Provider URLs
// =============================================================================

export const PROVIDER_URLS = {
    OLLAMA_DEFAULT: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    HUGGINGFACE_INFERENCE: 'https://api-inference.huggingface.co/models',
    GROQ_BASE: 'https://api.groq.com/openai/v1',
    DEEPSEEK_BASE: 'https://api.deepseek.com/v1'
};

// =============================================================================
// Cost Limits
// =============================================================================

export const COST_LIMITS = {
    /** Default max cost per query ($) */
    DEFAULT_MAX_COST: 1.00,

    /** Warning threshold (% of max) */
    WARNING_THRESHOLD: 0.8,

    /** Auto-abort threshold (% of max) */
    ABORT_THRESHOLD: 1.0
};
