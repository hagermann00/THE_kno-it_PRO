/**
 * Research Engine
 * Multi-LLM research orchestrator with statistical analysis
 * Now with intelligent grounding (Brave Search / Groq / Gemini)
 */

import { providerRegistry } from '../core/ProviderRegistry.js';
import { modelRegistry } from '../core/ModelRegistry.js';
import { TextGenParams, TextGenResult, ResearchDepth, ResearchResult, ResearchConfig } from '../core/types.js';
import { Y_IT_MASTER_PROTOCOL } from '../core/prompts.js';
import { ConsensusEngine } from './ConsensusEngine.js';
import { OutlierIsolator } from './OutlierIsolator.js';
import { logger } from '../core/logger.js';
import { TopicSchema } from '../core/validation.js';
import { StorageEngine } from '../core/StorageEngine.js';
import { ResearchError } from '../core/errors.js';
import { getPersona } from '../core/PersonaRegistry.js';
import { groundingSwitchboard, GroundingDecision, GroundingProvider } from '../core/GroundingSwitchboard.js';
import { createBraveSearchProvider, BraveSearchProvider } from '../providers/BraveSearchProvider.js';

export class ResearchEngine {
    private consensusEngine: ConsensusEngine;
    private outlierIsolator: OutlierIsolator;
    private storage: StorageEngine;
    private braveSearch: BraveSearchProvider | null;

    constructor(private config: ResearchConfig) {
        this.consensusEngine = new ConsensusEngine();
        this.outlierIsolator = new OutlierIsolator();
        this.storage = new StorageEngine();
        this.braveSearch = createBraveSearchProvider();
    }

    /**
     * Main research entry point
     */
    async investigate(topic: string): Promise<ResearchResult> {
        // Validate input
        const validatedTopic = TopicSchema.parse(topic);

        const startTime = Date.now();

        // -------------------------------------------------------------------------
        // SEMANTIC CACHE CHECK (Cost Saving)
        // -------------------------------------------------------------------------
        let topicVector: number[] | undefined;
        try {
            const gemini = providerRegistry.get('gemini') as any;
            if (gemini && typeof gemini.getEmbedding === 'function') {
                topicVector = await gemini.getEmbedding(validatedTopic);

                if (topicVector) {
                    const cached = this.storage.checkSemanticCache(topicVector, 0.92);

                    if (cached) {
                        logger.info('🎯 SEMANTIC CACHE HIT - Returning cached result', { topic: validatedTopic });
                        return { ...cached, fromCache: true };
                    }
                }
            }
        } catch (e) {
            logger.warn(`Semantic cache check failed: ${e}`);
        }

        // =====================================================================
        // INTELLIGENT GROUNDING: Decide if we need web data
        // =====================================================================
        const groundingDecision = groundingSwitchboard.analyze(validatedTopic);
        console.log('[DEBUG] Grounding Decision:', JSON.stringify(groundingDecision, null, 2));

        let groundingContext = '';
        let groundingProvider: GroundingProvider | null = null;

        if (groundingDecision.shouldGround) {
            // Select best available grounding provider
            const availableProviders = {
                groq: providerRegistry.has('groq'),
                brave: this.braveSearch?.isConfigured() || false,
                gemini: providerRegistry.has('gemini')
            };
            console.log('[DEBUG] Available Providers:', JSON.stringify(availableProviders, null, 2));

            groundingProvider = groundingSwitchboard.selectProvider(availableProviders);
            console.log('[DEBUG] Selected Provider:', JSON.stringify(groundingProvider, null, 2));

            logger.info(`🌐 Grounding enabled`, {
                reason: groundingDecision.reason,
                provider: groundingProvider.id,
                freshness: groundingDecision.suggestedFreshness
            });

            // Fetch grounding context (Brave Search only for now)
            if (groundingProvider.id === 'brave' && this.braveSearch) {
                try {
                    groundingContext = await this.braveSearch.getGroundingContext(
                        validatedTopic,
                        3 // max results
                    );
                } catch (err) {
                    logger.warn('Brave Search grounding failed', { error: err });
                }
            }
            // TODO: Add Groq built-in search and Gemini grounding when available
        } else {
            logger.info(`⏭️ Grounding skipped`, { reason: groundingDecision.reason });
        }

        // Select preset workflow
        const workflow = this.getWorkflow(this.config.depth);

        logger.info(`Starting ${this.config.depth} research`, { topic: validatedTopic });

        // Execute workflow (with optional grounding context)
        const responses = await this.executeWorkflow(topic, workflow, groundingContext);

        // Detect and remove outliers
        const outlierReport = await this.outlierIsolator.analyze(responses);

        logger.info('Outlier detection complete', { count: outlierReport.outliers.length });

        // Get valid responses only
        let validResponses = responses.filter(r =>
            outlierReport.validResponses.includes(r.model)
        );

        // FALLBACK: If all responses were rejected (high disagreement), use ALL responses
        // This prevents the "Cannot calculate consensus from zero responses" crash
        if (validResponses.length === 0) {
            logger.warn('All responses were outliers, falling back to raw dataset');
            validResponses = responses;
        }

        // Calculate consensus
        const modelResponses = validResponses.map((r: TextGenResult) => ({
            model: r.model,
            text: r.text,
            confidence: r.costEstimate
        }));

        const consensus = this.consensusEngine.calculateConsensus(modelResponses);
        const variance = this.consensusEngine.analyzeVariance(modelResponses, consensus);
        const derivatives = this.consensusEngine.deriveInsights(modelResponses, consensus, variance);
        const score = this.consensusEngine.calculateSystemConfidence(consensus, variance);

        // Build result
        const duration = Date.now() - startTime;
        const totalCost = responses.reduce((sum, r) => sum + r.costEstimate, 0);

        const result: ResearchResult = {
            topic,
            summary: this.generateSummary(consensus, variance),
            score,

            confirmed: consensus.items.map(item => ({
                claim: item.value,
                confidence: item.confidence > 0.8 ? 'high' : item.confidence > 0.5 ? 'medium' : 'low',
                agreedBy: item.models,
                disputedBy: []
            })),

            disputed: outlierReport.outliers
                .filter(o => o.classification.type === 'valuable-dissent')
                .map(o => ({
                    claim: o.response.substring(0, 200),
                    confidence: 'low',
                    agreedBy: [o.model],
                    disputedBy: validResponses.map(r => r.model)
                })),

            unique: variance.unique.map(u => ({
                claim: u.text,
                source: u.model,
                confidence: 'low',
                agreedBy: [u.model],
                disputedBy: []
            })),

            sources: [], // TODO: Extract URLs from responses

            metadata: {
                depth: this.config.depth,
                persona: this.config.persona || 'analyst',
                modelsUsed: responses.map(r => r.model),
                totalQueries: responses.length,
                duration
            },

            costBreakdown: {
                byModel: responses.reduce((acc, r) => {
                    acc[r.model] = r.costEstimate;
                    return acc;
                }, {} as Record<string, number>),
                total: totalCost
            },

            // Additional metadata (extended - will be stripped from type but useful)
            variance,
            derivatives,
            outliers: outlierReport.outliers
        };

        // Log to persistent storage (with vector for caching)
        this.storage.logResearch(validatedTopic, result, topicVector);

        logger.info('Research complete', {
            cost: totalCost.toFixed(4),
            duration: `${duration}ms`,
            models: responses.length
        });

        return result as any;
    }

    /**
     * Get workflow configuration for research depth
     */
    private getWorkflow(depth: ResearchDepth): WorkflowConfig {
        let models: string[] = [];
        let passes = 1;
        let validateOutliers = false;
        let tieBreaker: string | undefined;

        switch (depth) {
            case 'flash':
                models = ['gemini-2.5-flash-lite'];
                break;

            case 'budget':
                models = ['deepseek-chat'];
                break;

            case 'quick':
                models = ['gemini-2.5-flash'];
                break;

            case 'standard':
                models = ['gemini-2.5-flash', 'gpt-4o-mini', 'claude-3.5-haiku'];
                validateOutliers = true;
                break;

            case 'verified':
                models = ['gemini-2.5-flash', 'gpt-4o', 'claude-sonnet-4', 'deepseek-chat'];
                validateOutliers = true;
                tieBreaker = 'claude-sonnet-4.5';
                break;

            case 'deep-dive':
                models = [
                    'deepseek-chat',
                    'gemini-2.5-flash',
                    'claude-sonnet-4.5',
                    'gpt-4o',
                    'claude-sonnet-4',
                    'gemini-2.5-pro'
                ];
                passes = 2;
                validateOutliers = true;
                tieBreaker = 'o3';
                break;

            case 'y-it':
                // The "Universal Fallback" Protocol with BUDGET AWARENESS
                // Dynamically assigns roles based on what is available AND fits the budget.

                // 1. Define ideal candidates for each role (Sorted by Quality Descending)
                const candidates = {
                    invA: ['gemini-2.5-flash', 'gpt-4o-mini', 'claude-3.5-haiku'],
                    invB: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gpt-4o'], // Meta/Mistral preference
                    gap: ['gemini-3.0-pro', 'gemini-2.5-pro', 'gpt-4o', 'deepseek-chat', 'gemini-2.5-flash'], // Fallback to Flash if Pro too expensive
                    syn: ['gemini-3.0-pro', 'gemini-2.5-pro', 'claude-3.5-sonnet', 'gpt-4o', 'gemini-2.5-flash']
                };

                const budget = this.config.maxCost || 1.00; // Default $1.00 (plenty for pro)
                let currentCostSoFar = 0;

                // 2. Helper to find best available model that FITS BUDGET
                const pick = (list: string[], fallback: string): string => {
                    for (const m of list) {
                        if (!providerRegistry.getProviderForModel(m)) continue;

                        // Estimate cost for this agent (Assuming roughly 2k in, 1k out)
                        const estimatedAgentCost = modelRegistry.estimateCost(m, 2000, 1000);

                        if (currentCostSoFar + estimatedAgentCost <= budget) {
                            return m;
                        }
                    }
                    // If nothing fits budget, try to find ANY available model in list (cheapest first/last resort)
                    // We assume list is Quality Descending. Cheapest is likely at end or we check specifically.
                    // This is "Budget-First" so we default to Primary/Fallback if budget blown.
                    for (const m of list.reverse()) {
                        if (providerRegistry.getProviderForModel(m)) {
                            // Force pick even if over budget? Or strict cap? 
                            // "Throttle Mode" implies smart degradation.
                            return m;
                        }
                    }
                    return fallback;
                };

                // 3. Construct the team progressively cost-aware
                const primary = this.config.primaryModel;

                const invAId = pick(candidates.invA, primary);
                currentCostSoFar += modelRegistry.estimateCost(invAId, 2000, 1000);

                const invBId = pick(candidates.invB, primary);
                currentCostSoFar += modelRegistry.estimateCost(invBId, 2000, 1000);

                const gapId = pick(candidates.gap, primary);
                currentCostSoFar += modelRegistry.estimateCost(gapId, 2000, 1000);

                const synId = pick(candidates.syn, primary);

                models = [invAId, invBId, gapId, synId];

                passes = 2;
                validateOutliers = true;
                tieBreaker = models[3];
                break;

            default:
                models = [this.config.primaryModel];
        }

        // -------------------------------------------------------------------------
        // SMART FALLBACK (FREE TIER LOGIC)
        // Filter out models that originate from providers we don't have keys for.
        // -------------------------------------------------------------------------
        const availableModels = models.filter(m => {
            const provider = providerRegistry.getProviderForModel(m);
            return provider !== undefined;
        });

        // If we filtered out everything (e.g. user only has Gemini but requested 'budget' which is DeepSeek),
        // Force fallback to the Primary Model (which is guaranteed to exist by config defaults).
        if (availableModels.length === 0) {
            console.warn(`[ResearchEngine] Requested models [${models.join(', ')}] not available. Falling back to ${this.config.primaryModel}`);
            return {
                models: [this.config.primaryModel],
                passes: 1,
                validateOutliers: false
            };
        }

        return {
            models: availableModels,
            passes,
            validateOutliers: validateOutliers && availableModels.length > 1, // Can only find outliers if we have >1 model
            tieBreaker: tieBreaker && providerRegistry.getProviderForModel(tieBreaker) ? tieBreaker : undefined
        };
    }

    /**
     * Execute workflow
     * @param groundingContext - Optional web context to inject into prompts
     */
    private async executeWorkflow(topic: string, workflow: WorkflowConfig, groundingContext: string = ''): Promise<TextGenResult[]> {
        const results: TextGenResult[] = [];

        // Pass 1: Parallel or Sequential Generation (based on strategy)
        console.log(`[ResearchEngine] Pass 1: ${workflow.models.length - 1} models`);

        const modelsToRun = workflow.models.slice(0, workflow.models.length - 1);

        // Get persona definition
        const persona = getPersona(this.config.persona || 'analyst');

        // Helper to prepare params
        const prepareParams = (modelId: string, index: number): TextGenParams => {
            let specificFocus = '';
            if (workflow.models.length > 2 && (topic.includes('Dropshipping') || this.config.depth === 'y-it')) {
                if (index === 0) {
                    specificFocus = '\n\nFOCUS ONLY ON SECTION 1 (THE CAST) AND SECTION 2 (THE MATRIX). Go deep on stories and statistics.';
                } else if (index === 1) {
                    specificFocus = '\n\nFOCUS ONLY ON SECTION 3 (THE TREASURY) AND SECTION 4 (EXECUTION DATA). Go deep on affiliate tools, costs, and ethical scores.';
                } else if (index === 2) {
                    specificFocus = '\n\nROLE: Gap Hunter / Devil\'s Advocate.\nTASK: Do NOT generate a standard report.\nINSTEAD: List the "Unknown Unknowns", the questions we aren\'t asking, and the contradictions in the standard narrative. Identify 3 critical blind spots.';
                }
            }



            let baseParams = `Research the following topic thoroughly. Provide specific facts, data, and sources where possible:\n\n${topic}`;

            if (this.config.depth === 'y-it') {
                baseParams = Y_IT_MASTER_PROTOCOL.replace(/{{TOPIC}}/g, topic);
            }

            const researchPrompt = groundingContext
                ? `${groundingContext}\n\nBased on the above web context and your knowledge, execute the following protocol:\n\n${baseParams}${specificFocus}`
                : `${baseParams}${specificFocus}`;

            return {
                prompt: researchPrompt,
                systemPrompt: persona.systemPrompt,
                model: modelId,
                maxTokens: 1000
            };
        };

        if (this.config.depth === 'y-it') {
            // SEQUENTIAL EXECUTION ("Stretched Out")
            console.log('[ResearchEngine] Running agents sequentially to manage rate limits...');

            for (let i = 0; i < modelsToRun.length; i++) {
                const modelId = modelsToRun[i];
                const provider = providerRegistry.getProviderForModel(modelId);

                if (!provider) {
                    console.warn(`[ResearchEngine] No provider for ${modelId}, skipping.`);
                    continue;
                }

                try {
                    console.log(`[ResearchEngine] Agent ${modelId} starting...`);
                    const params = prepareParams(modelId, i);
                    const result = await provider.generateText(params);
                    results.push(result);
                    console.log(`[ResearchEngine] Agent ${modelId} finished.`);
                } catch (error) {
                    console.error(`[ResearchEngine] Error with ${modelId}:`, error);
                }

                // The "Stretch" - Wait 5 seconds between agents to be safe vs 15/min limit
                if (i < modelsToRun.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        } else {
            // PARALLEL EXECUTION (Original Speed)
            const promises = modelsToRun.map(async (modelId, index) => {
                const provider = providerRegistry.getProviderForModel(modelId);
                if (!provider) return null;

                const params = prepareParams(modelId, index);

                try {
                    return await provider.generateText(params);
                } catch (error) {
                    console.error(`[ResearchEngine] Error with ${modelId}:`, error);
                    return null;
                }
            });

            const parallelResults = await Promise.all(promises);
            parallelResults.forEach(r => { if (r) results.push(r); });
        }


        // Pass 2: Refinement (Synthesizer)
        if (workflow.passes > 1 && results.length > 0) {
            console.log(`[ResearchEngine] Pass 2: Refinement`);

            // Synthesize findings from pass 1
            // Determine synthesizer index (Last model in the list)
            const synthesizerIndex = workflow.models.length - 1;

            const synthesisPersona = (workflow.models[synthesizerIndex] === 'gemini-2.5-flash' || workflow.models[synthesizerIndex] === 'gemini-2.5-pro' || workflow.models[synthesizerIndex] === 'gemini-3.0-pro') && this.config.depth === 'y-it'
                ? getPersona('amalgamator')
                : persona; // Default to original persona

            const synthesisPrompt = this.config.depth === 'y-it'
                ? `AMALGOMATE WITH REDUNREMOVE:\n\nGROUNDING CONTEXT (FACT CHECK):\n${groundingContext || 'No grounding data available.'}\n\nREPORTS:\n${results.map(r => `[REPORT ${r.model}]:\n${r.text}`).join('\n\n---\n\n')}\n\nTask: Fuse these into one Master File. Explicitly address the "Blind Spots" identified by the Gap Hunter. VERIFY claims against Grounding Context.`
                : `Based on these research findings, provide a refined analysis:\n\n${results.map(r => `[${r.model}]: ${r.text}`).join('\n\n---\n\n')}\n\nYour task: Synthesize the above into key facts, noting areas of agreement and disagreement.`;

            // Safety check: specific synthesizer or fallback to first model
            const synthesizerId = workflow.models[synthesizerIndex] || workflow.models[0];
            const synthesizer = providerRegistry.getProviderForModel(synthesizerId);

            if (synthesizer) {
                try {
                    const refined = await synthesizer.generateText({
                        prompt: synthesisPrompt,
                        systemPrompt: synthesisPersona.systemPrompt, // Use Amalgamator prompt here
                        model: synthesizerId,
                        maxTokens: 2000
                    });

                    results.push(refined);
                } catch (error) {
                    console.error('[ResearchEngine] Refinement error:', error);
                }
            }
        }

        return results;
    }

    /**
     * Generate executive summary
     */
    private generateSummary(consensus: any, variance: any): string {
        if (consensus.items.length === 0) {
            return 'No consensus reached. Models provided divergent responses.';
        }

        const topFacts = consensus.items.slice(0, 3).map((item: any) => item.value).join('. ');

        const varianceNote = variance.level === 'high'
            ? ' Note: High variance detected - answer may be context-dependent.'
            : '';

        return `${topFacts}${varianceNote}`;
    }
}

interface WorkflowConfig {
    models: string[];
    passes: number;
    validateOutliers: boolean;
    tieBreaker?: string;
}

