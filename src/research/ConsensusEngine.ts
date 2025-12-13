/**
 * Consensus Engine
 * Analyzes multiple model responses to find averages, variance, and derivatives
 */

// Types are defined locally below

export class ConsensusEngine {

    /**
     * Stage 1: AVERAGE - Find consensus
     */
    calculateConsensus(responses: ModelResponse[]): Consensus {
        if (responses.length === 0) {
            throw new Error('Cannot calculate consensus from zero responses');
        }

        // Extract all claims from responses
        const allClaims = this.extractClaims(responses);

        // Find claims mentioned by majority
        const threshold = Math.ceil(responses.length / 2);
        const consensusClaims = allClaims.filter(claim =>
            claim.mentionedBy.length >= threshold
        );

        // Calculate confidence scores
        const consensusWithConfidence = consensusClaims.map(claim => ({
            value: claim.text,
            confidence: claim.mentionedBy.length / responses.length,
            agreementCount: claim.mentionedBy.length,
            totalModels: responses.length,
            models: claim.mentionedBy
        }));

        return {
            items: consensusWithConfidence,
            threshold,
            totalResponses: responses.length
        };
    }

    /**
     * Stage 2: VARIANCE - Map disagreements
     */
    analyzeVariance(responses: ModelResponse[], consensus: Consensus): Variance {
        const disagreements: any[] = [];
        const uniqueClaims: any[] = [];

        // Find claims NOT in consensus
        const allClaims = this.extractClaims(responses);

        for (const claim of allClaims) {
            // Single-source claims
            if (claim.mentionedBy.length === 1) {
                uniqueClaims.push({
                    text: claim.text,
                    model: claim.mentionedBy[0],
                    confidence: 'low' as const
                });
            }

            // Minority claims (mentioned but not consensus)
            if (claim.mentionedBy.length > 1 && claim.mentionedBy.length < consensus.threshold) {
                disagreements.push({
                    text: claim.text,
                    models: claim.mentionedBy,
                    count: claim.mentionedBy.length
                });
            }
        }

        // Detect contradictions
        const contradictions = this.findContradictions(responses);

        // Calculate variance level
        const varianceScore = disagreements.length + contradictions.length;
        const level: 'low' | 'medium' | 'high' =
            varianceScore === 0 ? 'low' :
                varianceScore <= 2 ? 'medium' : 'high';

        return {
            level,
            disagreements,
            unique: uniqueClaims,
            contradictions,
            score: varianceScore
        };
    }

    /**
     * Stage 3: DERIVATIVES - Extract meta-insights
     */
    deriveInsights(
        responses: ModelResponse[],
        consensus: Consensus,
        variance: Variance
    ): Derivative[] {
        const insights: Derivative[] = [];

        // Pattern 1: Convergent Confidence
        if (variance.level === 'low' && consensus.items.length > 0) {
            insights.push({
                type: 'convergent-confidence',
                title: 'Strong Consensus',
                message: 'All models agree on core facts',
                reliability: 'high',
                actionable: false
            });
        }

        // Pattern 2: High Variance = Context Dependency
        if (variance.level === 'high') {
            const hasConditionals = responses.some(r =>
                this.hasConditionalLanguage(r.text)
            );

            if (hasConditionals) {
                insights.push({
                    type: 'context-dependency',
                    title: 'Context-Dependent Answer',
                    message: 'Models cite different conditions. Answer depends on unstated variables.',
                    reliability: 'medium',
                    actionable: true,
                    recommendation: 'Refine query with specific context (niche, timeframe, location)'
                });
            }
        }

        // Pattern 3: Unique Claims = Possible Hallucinations OR Valuable Insights
        if (variance.unique.length > 0) {
            insights.push({
                type: 'unique-claims',
                title: 'Single-Source Claims',
                message: `${variance.unique.length} fact(s) mentioned by only one model`,
                reliability: 'low',
                actionable: true,
                recommendation: 'Verify unique claims with external sources before trusting'
            });
        }

        // Pattern 4: Contradictions = Question Ambiguity
        if (variance.contradictions.length > 0) {
            insights.push({
                type: 'contradictions',
                title: 'Contradictory Answers Detected',
                message: 'Models gave conflicting information',
                reliability: 'uncertain',
                actionable: true,
                recommendation: 'Question may be ambiguous. Consider rephrasing or adding specifics.'
            });
        }

        // Pattern 5: Numerical Spread Analysis
        const numericalData = this.extractNumericalData(responses);
        if (numericalData.length > 0) {
            const stats = this.calculateStats(numericalData);

            if (stats.stdDev > stats.mean * 0.3) {  // High variance
                insights.push({
                    type: 'numerical-variance',
                    title: 'Value is a Distribution',
                    message: `Range: ${stats.min}-${stats.max}, Mean: ${stats.mean.toFixed(2)}`,
                    reliability: 'medium',
                    actionable: true,
                    recommendation: 'This metric varies widely. Don\'t rely on a single number.'
                });
            }
        }

        // Pattern 6: Confidence Inverse Correlation
        const confidenceLevels = this.analyzeConfidenceLevels(responses);
        if (confidenceLevels.highConfidenceIsOutlier) {
            insights.push({
                type: 'overconfidence-flag',
                title: 'Overconfidence Detected',
                message: 'Most confident answer is the outlier',
                reliability: 'low',
                actionable: true,
                recommendation: 'The most certain answer may be wrong. Trust ranges over point estimates.'
            });
        }

        return insights;
    }

    /**
     * Helper: Extract discrete claims from text
     */
    private extractClaims(responses: ModelResponse[]): Array<{ text: string; mentionedBy: string[] }> {
        const claimMap = new Map<string, string[]>();

        for (const response of responses) {
            // Split into sentences
            const sentences = response.text
                .split(/[.!?]+/)
                .map(s => s.trim())
                .filter(s => s.length > 10);

            for (const sentence of sentences) {
                // Normalize sentence
                const normalized = this.normalizeClaim(sentence);

                if (!claimMap.has(normalized)) {
                    claimMap.set(normalized, []);
                }

                if (!claimMap.get(normalized)!.includes(response.model)) {
                    claimMap.get(normalized)!.push(response.model);
                }
            }
        }

        return Array.from(claimMap.entries()).map(([text, mentionedBy]) => ({
            text,
            mentionedBy
        }));
    }

    /**
     * Helper: Normalize claim for comparison
     */
    private normalizeClaim(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .trim();
    }

    /**
     * Helper: Find contradictions
     */
    private findContradictions(responses: ModelResponse[]): any[] {
        // Simple implementation: look for negation patterns
        const contradictions: any[] = [];

        for (let i = 0; i < responses.length; i++) {
            for (let j = i + 1; j < responses.length; j++) {
                const hasNegation =
                    (responses[i].text.includes('not') && !responses[j].text.includes('not')) ||
                    (!responses[i].text.includes('not') && responses[j].text.includes('not'));

                if (hasNegation) {
                    contradictions.push({
                        model1: responses[i].model,
                        model2: responses[j].model,
                        text1: responses[i].text.substring(0, 100),
                        text2: responses[j].text.substring(0, 100)
                    });
                }
            }
        }

        return contradictions;
    }

    /**
     * Helper: Check for conditional language
     */
    private hasConditionalLanguage(text: string): boolean {
        const conditionals = [
            'depends on', 'depending on', 'varies', 'typically',
            'usually', 'generally', 'can range', 'may be', 'might be',
            'if', 'unless', 'provided that'
        ];

        const lowerText = text.toLowerCase();
        return conditionals.some(keyword => lowerText.includes(keyword));
    }

    /**
     * Helper: Extract numerical data
     */
    private extractNumericalData(responses: ModelResponse[]): number[] {
        const numbers: number[] = [];

        for (const response of responses) {
            // Match numbers (including percentages, decimals)
            const matches = response.text.match(/\d+\.?\d*/g);

            if (matches) {
                numbers.push(...matches.map(m => parseFloat(m)));
            }
        }

        return numbers;
    }

    /**
     * Helper: Calculate statistics
     */
    private calculateStats(data: number[]) {
        if (data.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };

        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);

        return {
            mean,
            stdDev,
            min: Math.min(...data),
            max: Math.max(...data)
        };
    }

    /**
     * Helper: Analyze confidence levels
     */
    private analyzeConfidenceLevels(responses: ModelResponse[]) {
        // Check if responses with strong language ("definitely", "certainly") are outliers
        const strongLanguage = ['definitely', 'certainly', 'absolutely', 'without doubt'];

        const confidenceScores = responses.map(r => ({
            model: r.model,
            hasStrongLanguage: strongLanguage.some(word => r.text.toLowerCase().includes(word)),
            hasHedging: this.hasConditionalLanguage(r.text)
        }));

        const highConfidenceCount = confidenceScores.filter(s => s.hasStrongLanguage).length;
        const hedgingCount = confidenceScores.filter(s => s.hasHedging).length;

        return {
            highConfidenceIsOutlier: highConfidenceCount === 1 && hedgingCount > 1,
            hedgingIsCommon: hedgingCount > responses.length / 2
        };
    }
}

// Type definitions for consensus analysis
interface ModelResponse {
    model: string;
    text: string;
    confidence?: number;
}

interface Consensus {
    items: Array<{
        value: string;
        confidence: number;
        agreementCount: number;
        totalModels: number;
        models: string[];
    }>;
    threshold: number;
    totalResponses: number;
}

interface Variance {
    level: 'low' | 'medium' | 'high';
    disagreements: any[];
    unique: any[];
    contradictions: any[];
    score: number;
}

interface Derivative {
    type: string;
    title: string;
    message: string;
    reliability: 'high' | 'medium' | 'low' | 'uncertain';
    actionable: boolean;
    recommendation?: string;
}

interface StatisticalFact {
    claim: string;
    consensus: Consensus['items'][0];
    variance: Variance;
    derivatives: Derivative[];
    modelOutputs: ModelResponse[];
}
