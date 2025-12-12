/**
 * Research Engine
 * Multi-LLM research orchestrator with statistical analysis
 */

import { providerRegistry } from '../core/ProviderRegistry';
import { modelRegistry } from '../core/ModelRegistry';
import { TextGenParams, TextGenResult, ResearchDepth, ResearchResult, ResearchConfig } from '../core/types';
import { ConsensusEngine } from './ConsensusEngine';
import { OutlierIsolator } from './OutlierIsolator';

export class ResearchEngine {
    private consensusEngine: ConsensusEngine;
    private outlierIsolator: OutlierIsolator;

    constructor(private config: ResearchConfig) {
        this.consensusEngine = new ConsensusEngine();
        this.outlierIsolator = new OutlierIsolator();
    }

    /**
     * Main research entry point
     */
    async investigate(topic: string): Promise<ResearchResult> {
        const startTime = Date.now();

        // Select preset workflow
        const workflow = this.getWorkflow(this.config.depth);

        console.log(`[ResearchEngine] Starting ${this.config.depth} research on: "${topic}"`);

        // Execute workflow
        const responses = await this.executeWorkflow(topic, workflow);

        // Detect and remove outliers
        const outlierReport = await this.outlierIsolator.analyze(responses);

        console.log(`[ResearchEngine] Found ${outlierReport.outliers.length} outliers`);

        // Get valid responses only
        const validResponses = responses.filter(r =>
            outlierReport.validResponses.includes(r.model)
        );

        // Calculate consensus
        const modelResponses = validResponses.map(r => ({
            model: r.model,
            text: r.text,
            confidence: r.costEstimate
        }));

        const consensus = this.consensusEngine.calculateConsensus(modelResponses);
        const variance = this.consensusEngine.analyzeVariance(modelResponses, consensus);
        const derivatives = this.consensusEngine.deriveInsights(modelResponses, consensus, variance);

        // Build result
        const duration = Date.now() - startTime;
        const totalCost = responses.reduce((sum, r) => sum + r.costEstimate, 0);

        const result: ResearchResult = {
            topic,
            summary: this.generateSummary(consensus, variance),

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

            // Additional metadata
            variance,
            derivatives,
            outliers: outlierReport.outliers
        };

        console.log(`[ResearchEngine] Complete. Cost: $${totalCost.toFixed(4)}, Time: ${duration}ms`);

        return result as any;
    }

    /**
     * Get workflow configuration for research depth
     */
    private getWorkflow(depth: ResearchDepth): WorkflowConfig {
        switch (depth) {
            case 'flash':
                return {
                    models: ['gemini-2.5-flash-lite'],
                    passes: 1,
                    validateOutliers: false
                };

            case 'budget':
                return {
                    models: ['deepseek-chat'],
                    passes: 1,
                    validateOutliers: false
                };

            case 'quick':
                return {
                    models: ['gemini-2.5-flash'],
                    passes: 1,
                    validateOutliers: false,
                };

            case 'standard':
                return {
                    models: ['gemini-2.5-flash', 'gpt-4o-mini', 'claude-3.5-haiku'],
                    passes: 1,
                    validateOutliers: true
                };

            case 'verified':
                return {
                    models: [
                        'gemini-2.5-flash',
                        'gpt-4o',
                        'claude-sonnet-4',
                        'deepseek-chat'
                    ],
                    passes: 1,
                    validateOutliers: true,
                    tieBreaker: 'claude-sonnet-4.5'
                };

            case 'deep-dive':
                return {
                    models: [
                        'deepseek-chat',        // Fast
                        'gemini-2.5-flash',     // Balanced
                        'claude-sonnet-4.5',    // Premium
                        'gpt-4o',               // Detective
                        'claude-sonnet-4',      // Skeptic
                        'gemini-2.5-pro'        // Insider
                    ],
                    passes: 2,  // Multi-pass with refinement
                    validateOutliers: true,
                    tieBreaker: 'o3'  // Reasoning model for final validation
                };

            default:
                return {
                    models: [this.config.primaryModel],
                    passes: 1,
                    validateOutliers: false
                };
        }
    }

    /**
     * Execute workflow
     */
    private async executeWorkflow(topic: string, workflow: WorkflowConfig): Promise<TextGenResult[]> {
        const results: TextGenResult[] = [];

        // Pass 1: Parallel research
        console.log(`[ResearchEngine] Pass 1: ${workflow.models.length} models`);

        const pass1Results = await Promise.all(
            workflow.models.map(async (modelId) => {
                const provider = providerRegistry.getProviderForModel(modelId);

                if (!provider) {
                    console.warn(`[ResearchEngine] No provider for model: ${modelId}`);
                    return null;
                }

                const params: TextGenParams = {
                    prompt: `Research the following topic thoroughly. Provide specific facts, data, and sources where possible:\n\n${topic}`,
                    systemPrompt: 'You are a research assistant. Provide accurate, well-sourced information. If you\'re uncertain, say so.',
                    model: modelId,
                    maxTokens: 1000
                };

                try {
                    return await provider.generateText(params);
                } catch (error) {
                    console.error(`[ResearchEngine] Error with ${modelId}:`, error);
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

        const topFacts = consensus.items.slice(0, 3).map(item => item.value).join('. ');

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
