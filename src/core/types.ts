/**
 * Kno-It Core Types
 * Provider-agnostic type definitions for the multi-LLM research engine
 */

// ============================================================================
// Provider Types
// ============================================================================

export type ProviderID = 'gemini' | 'openai' | 'anthropic' | 'deepseek';

export type ModelCapability =
    | 'text-generation'
    | 'json-mode'
    | 'image-generation'
    | 'image-editing'
    | 'audio-tts'
    | 'multi-speaker-tts'
    | 'web-search'
    | 'extended-thinking'
    | 'tool-calling'
    | 'vision';

export interface ModelDefinition {
    id: string;
    provider: ProviderID;
    displayName: string;
    version?: string;

    pricing: {
        inputPerMillion: number;
        outputPerMillion: number;
        cachedInputPerMillion?: number;
        thinkingPerMillion?: number;
        lastUpdated: string;
    };

    capabilities: ModelCapability[];
    contextWindow: number;
    maxOutput: number;

    speed: 'fast' | 'medium' | 'slow';
    qualityTier: 1 | 2 | 3 | 4 | 5;

    deprecated?: boolean;
    experimental?: boolean;
}

// ============================================================================
// Text Generation Types
// ============================================================================

export interface TextGenParams {
    prompt: string;
    systemPrompt?: string;
    model?: string;
    jsonSchema?: object;
    thinkingBudget?: number;
    tools?: ToolDefinition[];
    maxTokens?: number;
    temperature?: number;
}

export interface TextGenResult {
    text: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
        thinkingTokens?: number;
    };
    toolCalls?: ToolCall[];
    model: string;
    provider: ProviderID;
    costEstimate: number;
}

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: object;
}

export interface ToolCall {
    name: string;
    arguments: Record<string, unknown>;
}

// ============================================================================
// Research Types
// ============================================================================

export type ResearchDepth = 'flash' | 'budget' | 'quick' | 'standard' | 'verified' | 'deep-dive';

export interface ResearchConfig {
    depth: ResearchDepth;
    primaryModel: string;
    validationModel?: string;
    secondaryModels?: string[];
    enableMCP?: boolean;
    maxCost?: number;
}

export interface ResearchFact {
    claim: string;
    source?: string;
    confidence: 'high' | 'medium' | 'low';
    agreedBy: string[];  // Model IDs that confirmed this
    disputedBy?: string[];  // Model IDs that disagreed
}

export interface ResearchResult {
    topic: string;
    summary: string;

    confirmed: ResearchFact[];
    disputed: ResearchFact[];
    unique: ResearchFact[];  // Only found by one source

    sources: string[];

    metadata: {
        depth: ResearchDepth;
        modelsUsed: string[];
        totalQueries: number;
        duration: number;
    };

    costBreakdown: {
        byModel: Record<string, number>;
        total: number;
    };
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentConfig {
    name: string;
    role: string;
    model: string;
    systemPrompt: string;
    tools?: ToolDefinition[];
}

export type AgentStatus = 'idle' | 'working' | 'complete' | 'error';

export interface AgentState {
    name: string;
    status: AgentStatus;
    message?: string;
    progress?: number;
}

// ============================================================================
// MCP Types
// ============================================================================

export interface MCPServer {
    name: string;
    transport: 'stdio' | 'http';
    command?: string;
    url?: string;
}

export interface MCPTool {
    name: string;
    description: string;
    inputSchema: object;
    server: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface KnoItConfig {
    providers: {
        gemini?: { apiKey: string };
        openai?: { apiKey: string };
        anthropic?: { apiKey: string };
        deepseek?: { apiKey: string };
    };

    defaults: {
        researchDepth: ResearchDepth;
        primaryModel: string;
        validationModel?: string;
    };

    mcp?: {
        servers: MCPServer[];
    };

    limits?: {
        maxCostPerQuery?: number;
        maxQueriesPerMinute?: number;
    };
}
