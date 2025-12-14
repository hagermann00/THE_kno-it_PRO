/**
 * Brave Search Provider
 * Provides web search grounding for LLM responses.
 * Free tier: 2,000 queries/month
 * Paid: $5/1,000 queries (Base AI)
 * 
 * Use case: Ground LLM responses with real-time web data to reduce hallucinations.
 */

export interface BraveSearchConfig {
    apiKey: string;
    baseUrl?: string;
}

export interface BraveSearchResult {
    title: string;
    url: string;
    description: string;
    age?: string;
    extra_snippets?: string[];
}

export interface BraveSearchResponse {
    query: string;
    results: BraveSearchResult[];
    totalResults: number;
    cached: boolean;
}

export class BraveSearchProvider {
    readonly id = 'brave-search';
    readonly name = 'Brave Search';

    private apiKey: string;
    private baseUrl: string;

    constructor(config: BraveSearchConfig) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://api.search.brave.com/res/v1';
    }

    /**
     * Perform a web search query
     * @param query - Search query string
     * @param options - Optional search parameters
     */
    async search(
        query: string,
        options?: {
            count?: number;        // Results per page (1-20, default 10)
            freshness?: 'pd' | 'pw' | 'pm' | 'py'; // past day/week/month/year
            textFormat?: 'raw' | 'html';
            safesearch?: 'off' | 'moderate' | 'strict';
        }
    ): Promise<BraveSearchResponse> {
        const params = new URLSearchParams({
            q: query,
            count: String(options?.count || 5),
            text_format: options?.textFormat || 'raw',
            safesearch: options?.safesearch || 'moderate',
        });

        if (options?.freshness) {
            params.append('freshness', options.freshness);
        }

        const response = await fetch(`${this.baseUrl}/web/search?${params}`, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': this.apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brave Search API error (${response.status}): ${errorText}`);
        }

        const data = await response.json() as {
            web?: {
                results?: Array<{
                    title: string;
                    url: string;
                    description: string;
                    age?: string;
                    extra_snippets?: string[];
                }>;
                total_count?: number;
            };
        };

        // Transform Brave API response to our format
        const results: BraveSearchResult[] = (data.web?.results || []).map((r) => ({
            title: r.title,
            url: r.url,
            description: r.description,
            age: r.age,
            extra_snippets: r.extra_snippets,
        }));

        return {
            query,
            results,
            totalResults: data.web?.total_count || results.length,
            cached: false,
        };
    }

    /**
     * Get grounding context for an LLM query
     * Formats search results into a context string for injection into prompts
     */
    async getGroundingContext(query: string, maxResults: number = 3): Promise<string> {
        const searchResults = await this.search(query, { count: maxResults });

        if (searchResults.results.length === 0) {
            return '[No web results found for grounding]';
        }

        const context = searchResults.results
            .map((r, i) => {
                let snippet = `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.description}`;
                if (r.extra_snippets?.length) {
                    snippet += `\nAdditional: ${r.extra_snippets[0]}`;
                }
                return snippet;
            })
            .join('\n\n');

        return `--- WEB GROUNDING (Brave Search) ---\n${context}\n--- END GROUNDING ---`;
    }

    /**
     * Check if the provider is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey && this.apiKey.length > 0;
    }
}

// Factory function
export function createBraveSearchProvider(apiKey?: string): BraveSearchProvider | null {
    const key = apiKey || process.env.BRAVE_SEARCH_API_KEY;
    if (!key) {
        console.log('[BraveSearchProvider] No API key found. Brave Search grounding disabled.');
        return null;
    }
    return new BraveSearchProvider({ apiKey: key });
}
