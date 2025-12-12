/**
 * Outlier Isolator
 * Detects and classifies responses that deviate from consensus
 */

import { TextGenResult } from '../core/types';

export type OutlierType = 'hallucination' | 'valuable-dissent' | 'outdated' | 'misunderstood-query';

export interface OutlierResult {
    isOutlier: boolean;
    type?: OutlierType;
    confidence: number;
    reasoning: string;
    recommendation: string;
}

export interface OutlierReport {
    totalResponses: number;
    outliers: Array<{
        model: string;
        response: string;
        classification: OutlierResult;
    }>;
    validResponses: string[];
}

export class OutlierIsolator {

    /**
     * Analyze responses and detect outliers
     */
    async analyze(responses: TextGenResult[]): Promise<OutlierReport> {
        if (responses.length < 2) {
            return {
                totalResponses: responses.length,
                outliers: [],
                validResponses: responses.map(r => r.model)
            };
        }

        const report: OutlierReport = {
            totalResponses: responses.length,
            outliers: [],
            validResponses: []
        };

        // Step 1: Detect numerical outliers
        const numericalOutliers = this.detectNumericalOutliers(responses);

        // Step 2: Detect semantic outliers
        const semanticOutliers = this.detectSemanticOutliers(responses);

        // Step 3: Merge and classify
        const allOutlierModels = new Set([
            ...numericalOutliers,
            ...semanticOutliers
        ]);

        for (const response of responses) {
            if (allOutlierModels.has(response.model)) {
                const classification = this.classifyOutlier(
                    response,
                    responses.filter(r => !allOutlierModels.has(r.model))
                );

                report.outliers.push({
                    model: response.model,
                    response: response.text,
                    classification
                });
            } else {
                report.validResponses.push(response.model);
            }
        }

        return report;
    }

    /**
     * Method 1: Numerical Outlier Detection (Z-Score)
     */
    private detectNumericalOutliers(responses: TextGenResult[]): string[] {
        const outliers: string[] = [];

        // Extract all numbers from responses
        const numbersByModel = responses.map(r => ({
            model: r.model,
            numbers: this.extractNumbers(r.text)
        }));

        // Group by similar magnitude (% vs absolute numbers)
        const percentages = numbersByModel.map(m => ({
            model: m.model,
            values: m.numbers.filter(n => n < 100)  // Likely percentages/ratios
        })).filter(m => m.values.length > 0);

        if (percentages.length >= 3) {
            // Calculate mean and std dev
            const allValues = percentages.flatMap(m => m.values);
            const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
            const stdDev = Math.sqrt(
                allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length
            );

            // Flag outliers (Z-score > 2.5)
            for (const item of percentages) {
                const avgValue = item.values.reduce((a, b) => a + b, 0) / item.values.length;
                const zScore = Math.abs((avgValue - mean) / stdDev);

                if (zScore > 2.5) {
                    outliers.push(item.model);
                }
            }
        }

        return outliers;
    }

    /**
     * Method 2: Semantic Outlier Detection (Text Similarity)
     */
    private detectSemanticOutliers(responses: TextGenResult[]): string[] {
        const outliers: string[] = [];

        // Simple implementation: word overlap
        const wordSets = responses.map(r => ({
            model: r.model,
            words: new Set(r.text.toLowerCase().split(/\s+/).filter(w => w.length > 3))
        }));

        // Calculate pairwise similarity
        for (let i = 0; i < wordSets.length; i++) {
            let totalSimilarity = 0;

            for (let j = 0; j < wordSets.length; j++) {
                if (i === j) continue;

                const similarity = this.jaccardSimilarity(wordSets[i].words, wordSets[j].words);
                totalSimilarity += similarity;
            }

            const avgSimilarity = totalSimilarity / (wordSets.length - 1);

            // Flag if average similarity < 30%
            if (avgSimilarity < 0.3) {
                outliers.push(wordSets[i].model);
            }
        }

        return outliers;
    }

    /**
     * Classify outlier type
     */
    private classifyOutlier(
        outlier: TextGenResult,
        consensus: TextGenResult[]
    ): OutlierResult {
        // Heuristic classification
        const outlierNumbers = this.extractNumbers(outlier.text);
        const consensusNumbers = consensus.flatMap(r => this.extractNumbers(r.text));

        // Check for extreme numerical deviation (10x+ off)
        if (outlierNumbers.length > 0 && consensusNumbers.length > 0) {
            const outlierAvg = outlierNumbers.reduce((a, b) => a + b, 0) / outlierNumbers.length;
            const consensusAvg = consensusNumbers.reduce((a, b) => a + b, 0) / consensusNumbers.length;

            if (outlierAvg > consuAvg * 10 || outlierAvg < consensusAvg / 10) {
                return {
                    isOutlier: true,
                    type: 'hallucination',
                    confidence: 0.9,
                    reasoning: `Numerical value ${outlierAvg.toFixed(2)} is 10x+ different from consensus ${consensusAvg.toFixed(2)}`,
                    recommendation: 'EXCLUDE from final answer. Likely hallucination or data error.'
                };
            }
        }

        // Check for temporal language (outdated info)
        const hasTemporalLanguage = /as of \d{4}|in \d{4}|back in|historically|used to be/i.test(outlier.text);
        if (hasTemporalLanguage) {
            return {
                isOutlier: true,
                type: 'outdated',
                confidence: 0.7,
                reasoning: 'Response contains temporal language suggesting outdated information',
                recommendation: 'NOTE as historical perspective. May have been correct in the past.'
            };
        }

        // Check for semantic divergence (answering different question)
        const consensusWords = new Set(
            consensus.flatMap(r => r.text.toLowerCase().split(/\s+/))
        );
        const outlierWords = new Set(outlier.text.toLowerCase().split(/\s+/));

        const overlap = this.jaccardSimilarity(consensusWords, outlierWords);
        if (overlap < 0.2) {
            return {
                isOutlier: true,
                type: 'misunderstood-query',
                confidence: 0.75,
                reasoning: 'Response semantically divergent. May have interpreted question differently.',
                recommendation: 'RE-RUN with clarified prompt. This model answered a related but different question.'
            };
        }

        // Default: Valuable dissent
        return {
            isOutlier: true,
            type: 'valuable-dissent',
            confidence: 0.6,
            reasoning: 'Different perspective but internally consistent',
            recommendation: 'INCLUDE as alternative viewpoint. May represent minority perspective.'
        };
    }

    /**
     * Helper: Extract numbers from text
     */
    private extractNumbers(text: string): number[] {
        const matches = text.match(/\d+\.?\d*/g);
        return matches ? matches.map(m => parseFloat(m)) : [];
    }

    /**
     * Helper: Calculate Jaccard similarity between two sets
     */
    private jaccardSimilarity(setA: Set<any>, setB: Set<any>): number {
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);

        return union.size === 0 ? 0 : intersection.size / union.size;
    }
}
