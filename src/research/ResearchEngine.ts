/**
 * Research Engine
 * Multi-LLM research orchestrator with statistical analysis
 */

import { providerRegistry } from '../core/ProviderRegistry.js';
import { modelRegistry } from '../core/ModelRegistry.js';
import { TextGenParams, TextGenResult, ResearchDepth, ResearchResult, ResearchConfig } from '../core/types.js';
import { ConsensusEngine } from './ConsensusEngine.js';
import { OutlierIsolator } from './OutlierIsolator.js';
import { logger } from '../core/logger.js';
import { TopicSchema } from '../core/validation.js';
import { StorageEngine } from '../core/StorageEngine.js';
import { ResearchError } from '../core/errors.js';
import { getPersona } from '../core/PersonaRegistry.js';

export class ResearchEngine {
    private consensusEngine: ConsensusEngine;
    private outlierIsolator: OutlierIsolator;
    private storage: StorageEngine;

    constructor(private config: ResearchConfig) {
        this.consensusEngine = new ConsensusEngine();
        this.outlierIsolator = new OutlierIsolator();
        this.storage = new StorageEngine();
    }

    /**
     * Main research entry point
     */
    async investigate(topic: string): Promise<ResearchResult> {
        // Validate input
        const validatedTopic = TopicSchema.parse(topic);

        const startTime = Date.now();

        // Select preset workflow
        const workflow = this.getWorkflow(this.config.depth);

        logger.info(`Starting ${this.config.depth} research`, { topic: validatedTopic });

        // Execute workflow
        const responses = await this.executeWorkflow(topic, workflow);

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

        // Log to persistent storage
        this.storage.logResearch(validatedTopic, result);

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
     */
    private async executeWorkflow(topic: string, workflow: WorkflowConfig): Promise<TextGenResult[]> {
        const results: TextGenResult[] = [];

        // Pass 1: Parallel research
        console.log(`[ResearchEngine] Pass 1: ${workflow.models.length} models`);

        // Get persona definition
        const persona = getPersona(this.config.persona || 'analyst');

        const pass1Results = await Promise.all(
            workflow.models.map(async (modelId) => {
                const provider = providerRegistry.getProviderForModel(modelId);

                if (!provider) {
                    logger.warn(`No provider for model: ${modelId}`);
                    return null;
                }

                const params: TextGenParams = {
                    prompt: `Research the following topic thoroughly. Provide specific facts, data, and sources where possible:\n\n${topic}`,
                    systemPrompt: persona.systemPrompt,
                    model: modelId,
                    maxTokens: 1000
                };

                try {
                    return await provider.generateText(params);
                } catch (error: any) {
                    const msg = error?.message || String(error);
                    if (msg.includes('credit') || msg.includes('balance') || msg.includes('quota') || msg.includes('402')) {
                        logger.warn(`⚠️ [BILLING] Skipping ${modelId}: Insufficient funds/quota.`);
                    } else if (msg.includes('rate limit') || msg.includes('429')) {
                        logger.warn(`⚠️ [RATE LIMIT] Skipping ${modelId}: Too many requests.`);
                    } else {
                        logger.error(`[ResearchEngine] Error with ${modelId}:`, error);
                    }

                    // AUTO-SUBSTITUTION: Try to find a backup "chair" to fill the spot
                    try {
                        const allProviders = providerRegistry.listAvailable();
                        // Simple fallback chain: Gemini -> Groq -> OpenAI -> Anthropic
                        // We pick one that ISN'T the current provider
                        const currentProviderId = provider.id;
                        const backupProviderId = allProviders.find(p => p !== currentProviderId);

                        if (backupProviderId) {
                            const backupModel =
                                backupProviderId === 'gemini' ? 'gemini-2.5-flash' :
                                    backupProviderId === 'groq' ? 'llama3-70b-8192' :
                                        backupProviderId === 'openai' ? 'gpt-4o-mini' :
                                            'claude-3.5-haiku'; // anthropic default

                            if (workflow.models.includes(backupModel)) {
                                // Already in use, don't duplicate
                                return null;
                            }

                            logger.info(`🔄 [AUTO-REPLACE] Substituting ${modelId} with ${backupModel} (${backupProviderId})`);

                            const backupProvider = providerRegistry.get(backupProviderId);
                            if (backupProvider) {
                                return await backupProvider.generateText({
                                    ...params,
                                    model: backupModel
                                });
                            }
                        }
                    } catch (substitutionError) {
                        logger.warn(`[Auto-Replace] Substitution failed: ${substitutionError}`);
                    }

                    return null;
                }
            })
        );

        results.push(...pass1Results.filter((r): r is TextGenResult => r !== null));

        // Pass 2: Refinement (if deep-dive)
        if (workflow.passes > 1 && results.length > 0) {
            console.log(`[ResearchEngine] Pass 2: Refinement`);

            // Synthesize findings from pass 1
            const synthesisPrompt = `
Based on these research findings, provide a refined analysis:

${results.map(r => `[${r.model}]: ${r.text}`).join('\n\n---\n\n')}

Your task: Synthesize the above into key facts, noting areas of agreement and disagreement.
      `.trim();

            const synthesizer = providerRegistry.getProviderForModel(workflow.models[2]);
            if (synthesizer) {
                try {
                    const refined = await synthesizer.generateText({
                        prompt: synthesisPrompt,
                        model: workflow.models[2],
                        maxTokens: 1500
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
