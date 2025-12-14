/**
 * Grounding Switchboard
 * Intelligently determines when web grounding is necessary vs wasteful.
 * 
 * GOAL: Don't burn API calls on queries that LLMs can answer from training data.
 * 
 * Grounding NEEDED:
 * - Current events (news, stocks, weather)
 * - Time-sensitive data (prices, dates, availability)
 * - Recent developments (last 6 months)
 * - Verification of specific claims
 * 
 * Grounding NOT NEEDED:
 * - Conceptual/educational questions ("What is photosynthesis?")
 * - Historical facts ("When did WWII end?")
 * - Opinion/creative tasks ("Write me a poem")
 * - Math/logic problems
 * - Code generation (unless about current APIs)
 */

export type GroundingDecision = {
    shouldGround: boolean;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
    suggestedFreshness?: 'pd' | 'pw' | 'pm' | 'py'; // past day/week/month/year
};

// Keywords that indicate temporal/current data is needed
const TEMPORAL_KEYWORDS = [
    'today', 'yesterday', 'this week', 'this month', 'this year',
    'latest', 'recent', 'current', 'now', '2025', '2026',
    'breaking', 'news', 'update', 'just', 'new',
    'stock', 'price', 'cost', 'rate', 'weather', 'forecast'
];

// Keywords that indicate verification is needed
const VERIFICATION_KEYWORDS = [
    'is it true', 'fact check', 'verify', 'confirm', 'accurate',
    'real', 'fake', 'hoax', 'rumor', 'claim', 'source'
];

// Keywords that indicate NO grounding needed
const STATIC_KNOWLEDGE_KEYWORDS = [
    'what is', 'explain', 'how does', 'why do', 'define',
    'concept', 'theory', 'principle', 'history of', 'meaning of',
    'write me', 'create', 'generate', 'compose', 'imagine',
    'calculate', 'solve', 'compute', 'derive', 'prove'
];

// Topics that are almost always temporal
const TEMPORAL_TOPICS = [
    'stock market', 'cryptocurrency', 'bitcoin', 'ethereum',
    'election', 'sports score', 'game result',
    'release date', 'availability', 'in stock',
    'api pricing', 'api changes', 'deprecation'
];

// Topics that rarely need grounding
const STATIC_TOPICS = [
    'algorithm', 'data structure', 'programming concept',
    'math', 'physics', 'chemistry', 'biology',
    'philosophy', 'psychology', 'literature',
    'recipe', 'cooking technique'
];

export class GroundingSwitchboard {
    /**
     * Analyze a query and decide if web grounding is necessary
     */
    analyze(query: string): GroundingDecision {
        const lowerQuery = query.toLowerCase();

        // Check for explicit temporal indicators
        const hasTemporalKeyword = TEMPORAL_KEYWORDS.some(kw => lowerQuery.includes(kw));
        const hasVerificationKeyword = VERIFICATION_KEYWORDS.some(kw => lowerQuery.includes(kw));
        const hasStaticKeyword = STATIC_KNOWLEDGE_KEYWORDS.some(kw => lowerQuery.includes(kw));

        const isTemporalTopic = TEMPORAL_TOPICS.some(topic => lowerQuery.includes(topic));
        const isStaticTopic = STATIC_TOPICS.some(topic => lowerQuery.includes(topic));

        // Decision logic

        // HIGH CONFIDENCE: Ground
        if (hasVerificationKeyword) {
            return {
                shouldGround: true,
                reason: 'Query requests fact verification',
                confidence: 'high',
                suggestedFreshness: 'pm'
            };
        }

        if (isTemporalTopic) {
            return {
                shouldGround: true,
                reason: `Topic "${this.matchedTopic(lowerQuery, TEMPORAL_TOPICS)}" requires current data`,
                confidence: 'high',
                suggestedFreshness: 'pd' // past day for stocks/prices
            };
        }

        // HIGH CONFIDENCE: Don't ground
        if (isStaticTopic && !hasTemporalKeyword) {
            return {
                shouldGround: false,
                reason: `Topic "${this.matchedTopic(lowerQuery, STATIC_TOPICS)}" is static knowledge`,
                confidence: 'high'
            };
        }

        if (hasStaticKeyword && !hasTemporalKeyword) {
            return {
                shouldGround: false,
                reason: 'Query is conceptual/educational',
                confidence: 'medium'
            };
        }

        // MEDIUM CONFIDENCE: Ground if temporal
        if (hasTemporalKeyword) {
            const freshness = this.inferFreshness(lowerQuery);
            return {
                shouldGround: true,
                reason: 'Query contains temporal indicators',
                confidence: 'medium',
                suggestedFreshness: freshness
            };
        }

        // LOW CONFIDENCE: Default to no grounding (save money)
        return {
            shouldGround: false,
            reason: 'No clear indicators of temporal data need',
            confidence: 'low'
        };
    }

    /**
     * Infer how fresh the data needs to be
     */
    private inferFreshness(query: string): 'pd' | 'pw' | 'pm' | 'py' {
        if (query.includes('today') || query.includes('now') || query.includes('breaking')) {
            return 'pd'; // past day
        }
        if (query.includes('this week') || query.includes('latest')) {
            return 'pw'; // past week
        }
        if (query.includes('this month') || query.includes('recent')) {
            return 'pm'; // past month
        }
        return 'py'; // past year (default for temporal queries)
    }

    /**
     * Find which topic matched
     */
    private matchedTopic(query: string, topics: string[]): string {
        return topics.find(t => query.includes(t)) || 'unknown';
    }

    /**
     * Force grounding for specific use cases
     */
    forceGround(reason: string): GroundingDecision {
        return {
            shouldGround: true,
            reason: `Forced: ${reason}`,
            confidence: 'high',
            suggestedFreshness: 'pw'
        };
    }

    /**
     * Skip grounding for specific use cases
     */
    skipGround(reason: string): GroundingDecision {
        return {
            shouldGround: false,
            reason: `Skipped: ${reason}`,
            confidence: 'high'
        };
    }

    /**
     * Select the best grounding provider based on cost and availability
     * Priority: Groq (free built-in) > Brave (2K free/mo) > Gemini (5K free, then $14/1K)
     */
    selectProvider(availableProviders: {
        groq?: boolean;      // Has Groq with built-in web search
        brave?: boolean;     // Has Brave Search API key
        gemini?: boolean;    // Has Gemini with grounding enabled
    }): GroundingProvider {
        // Priority 1: Groq built-in (free with inference)
        if (availableProviders.groq) {
            return {
                id: 'groq',
                name: 'Groq Built-in Web Search',
                cost: 'free',
                reason: 'Included with Groq inference'
            };
        }

        // Priority 2: Brave Search (cheaper after free tier)
        if (availableProviders.brave) {
            return {
                id: 'brave',
                name: 'Brave Search API',
                cost: '2K free/mo, then $5/1K',
                reason: 'Independent index, privacy-focused'
            };
        }

        // Priority 3: Gemini Grounding (most expensive after Jan 2026)
        if (availableProviders.gemini) {
            return {
                id: 'gemini',
                name: 'Gemini Google Search Grounding',
                cost: '5K free/mo, then $14/1K (Jan 2026)',
                reason: 'Native Gemini integration'
            };
        }

        // No grounding available
        return {
            id: 'none',
            name: 'No Grounding',
            cost: 'N/A',
            reason: 'No grounding providers configured'
        };
    }
}

export type GroundingProvider = {
    id: 'groq' | 'brave' | 'gemini' | 'none';
    name: string;
    cost: string;
    reason: string;
};

// Singleton instance
export const groundingSwitchboard = new GroundingSwitchboard();
