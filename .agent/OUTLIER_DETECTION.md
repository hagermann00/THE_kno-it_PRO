---
description: Outlier detection and isolation system for multi-model research
---

# Outlier Response Isolator

## Purpose

Automatically detect when one model's response is statistically or semantically divergent from the consensus, then:
1. **Flag it** as an outlier
2. **Analyze WHY** it's different
3. **Determine if it's a hallucination OR valuable dissent**

---

## Detection Methods

### Method 1: Numerical Outlier (Z-Score)

```typescript
/**
 * For numerical responses (percentages, dates, quantities)
 */
function detectNumericalOutlier(responses: number[]): OutlierResult {
  const mean = average(responses);
  const stdDev = standardDeviation(responses);
  
  const outliers = responses.filter(value => {
    const zScore = Math.abs((value - mean) / stdDev);
    return zScore > 2.5;  // More than 2.5 standard deviations
  });
  
  return {
    outliers,
    threshold: 2.5,
    interpretation: outliers.length > 0 
      ? 'Values significantly deviate from consensus'
      : 'All values within normal range'
  };
}
```

**Example:**
```
Query: "How many active users does Reddit have?"

Responses:
- Gemini:  500M
- GPT-4o:  430M
- Claude:  450M
- DeepSeek: 52M  ← OUTLIER (Z-score = 3.2)

Analysis: DeepSeek is 10x off. Likely hallucination or outdated data.
```

---

### Method 2: Semantic Divergence

```typescript
/**
 * For text responses - use embedding similarity
 */
async function detectSemanticOutlier(
  responses: ModelResponse[]
): Promise<OutlierResult> {
  
  // Get embeddings for each response
  const embeddings = await Promise.all(
    responses.map(r => getEmbedding(r.text))
  );
  
  // Calculate pairwise similarity
  const similarities = calculatePairwiseSimilarity(embeddings);
  
  // Find response with lowest average similarity to others
  const avgSimilarities = embeddings.map((_, idx) => ({
    model: responses[idx].model,
    avgSimilarity: average(similarities[idx])
  }));
  
  const threshold = 0.7; // 70% similarity
  const outliers = avgSimilarities.filter(s => s.avgSimilarity < threshold);
  
  return {
    outliers,
    method: 'semantic-embedding',
    interpretation: outliers.length > 0
      ? 'Response semantically different from consensus'
      : 'All responses semantically aligned'
  };
}
```

**Example:**
```
Query: "What's the best e-commerce platform?"

Responses:
- Gemini:  "Shopify is best for ease of use, WooCommerce for customization"
- GPT-4o:  "Shopify leads the market, followed by BigCommerce"
- Claude:  "Top choices are Shopify, WooCommerce, and Magento"
- DeepSeek: "Use WordPress with Elementor for maximum control"  ← OUTLIER

Analysis: DeepSeek is talking about website builders, not e-commerce platforms.
Likely misunderstood the query.
```

---

### Method 3: Categorical Disagreement

```typescript
/**
 * For categorical responses (yes/no, lists, rankings)
 */
function detectCategoricalOutlier(
  responses: ModelResponse[]
): OutlierResult {
  
  // Extract key entities/concepts from each response
  const entities = responses.map(r => extractEntities(r.text));
  
  // Find consensus items (mentioned by majority)
  const consensusItems = findMajority(entities, threshold = 0.6);
  
  // Find outlier: response with least overlap with consensus
  const overlaps = entities.map((set, idx) => ({
    model: responses[idx].model,
    overlap: calculateOverlap(set, consensusItems),
    uniqueItems: set.filter(item => !consensusItems.includes(item))
  }));
  
  const outliers = overlaps.filter(o => o.overlap < 0.5);
  
  return {
    outliers,
    consensusItems,
    interpretation: 'Response mentions different items than consensus'
  };
}
```

**Example:**
```
Query: "Top programming languages in 2024?"

Responses:
- Gemini:  Python, JavaScript, TypeScript, Java, C++
- GPT-4o:  Python, JavaScript, Java, TypeScript, Go
- Claude:  JavaScript, Python, TypeScript, Java, Rust
- DeepSeek: Fortran, COBOL, Pascal, Assembly  ← OUTLIER

Consensus: [Python, JavaScript, TypeScript, Java]
Outlier: DeepSeek (0% overlap with consensus)

Analysis: DeepSeek listed legacy languages. Possible hallucination or training data issue.
```

---

## Outlier Classification

Once detected, classify the outlier:

### Type A: **Hallucination** (Discard)
- Factually incorrect
- No supporting evidence
- Contradicts established facts

**Indicators:**
- Numerical value 10x+ off
- No other model mentions this
- Contradicts known ground truth

**Action:** Flag as unreliable, exclude from consensus

---

### Type B: **Valuable Dissent** (Highlight)
- Provides alternative perspective
- Backed by reasoning
- May represent minority view or niche expertise

**Indicators:**
- Cites specific sources
- Explains WHY it differs
- Represents a valid but uncommon viewpoint

**Action:** Include in "Alternative Perspectives" section

---

### Type C: **Outdated Information** (Context)
- Was correct in the past
- Now superseded by newer data
- Reflects knowledge cutoff

**Indicators:**
- Temporal language ("As of 2023...")
- Matches older sources
- Newer models disagree

**Action:** Note as "Historical perspective"

---

### Type D: **Misunderstood Query** (Re-run)
- Model interpreted question differently
- Answered a related but different question
- Semantic drift

**Indicators:**
- Semantically divergent but internally consistent
- Answers a plausible interpretation
- Would make sense for a different query

**Action:** Clarify query, re-run with better prompt

---

## Outlier Isolation Workflow

```typescript
class OutlierIsolator {
  
  async analyze(responses: ModelResponse[]): Promise<OutlierReport> {
    const report: OutlierReport = {
      totalResponses: responses.length,
      outliers: [],
      consensus: null
    };
    
    // Step 1: Detect outliers
    const numericalOutliers = this.detectNumerical(responses);
    const semanticOutliers = await this.detectSemantic(responses);
    const categoricalOutliers = this.detectCategorical(responses);
    
    // Step 2: Merge detection results
    const allOutliers = this.mergeOutliers([
      numericalOutliers,
      semanticOutliers,
      categoricalOutliers
    ]);
    
    // Step 3: Classify each outlier
    for (const outlier of allOutliers) {
      const classification = await this.classifyOutlier(
        outlier,
        responses.filter(r => !allOutliers.includes(r))
      );
      
      report.outliers.push({
        model: outlier.model,
        response: outlier.text,
        type: classification.type,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
        recommendation: classification.recommendation
      });
    }
    
    // Step 4: Calculate consensus from non-outliers
    const validResponses = responses.filter(r => 
      !allOutliers.some(o => o.model === r.model)
    );
    
    report.consensus = this.calculateConsensus(validResponses);
    
    return report;
  }
  
  private async classifyOutlier(
    outlier: ModelResponse,
    consensus: ModelResponse[]
  ): Promise<OutlierClassification> {
    
    // Use a reasoning model (o3 or Claude Opus) to classify
    const classifier = new OpenAIProvider(process.env.OPENAI_API_KEY!);
    
    const prompt = `
You are analyzing a research outlier.

CONSENSUS (3 models agreed):
${consensus.map(r => `- ${r.model}: ${r.text}`).join('\n')}

OUTLIER:
- ${outlier.model}: ${outlier.text}

Classify this outlier as:
A) Hallucination (factually wrong, discard)
B) Valuable Dissent (alternative perspective, highlight)
C) Outdated Information (was correct in past, note context)
D) Misunderstood Query (answered different question, re-run)

Return JSON: {"type": "A|B|C|D", "confidence": 0-1, "reasoning": "..."}
    `.trim();
    
    const result = await classifier.generateText({
      prompt,
      model: 'o3',
      jsonSchema: OutlierClassificationSchema
    });
    
    return JSON.parse(result.text);
  }
}
```

---

## UI Output

```
═══════════════════════════════════════════════════════════════

🎯 CONSENSUS (3 models)
  "Dropshipping profit margins: 15-20%"
  
  ✅ Gemini Flash:  "15-20%"
  ✅ GPT-4o:        "18-22%"
  ✅ Claude Sonnet: "15-25%"

───────────────────────────────────────────────────────────────

⚠️  OUTLIER DETECTED

  ❌ DeepSeek Chat: "60-80% profit margin is achievable"
  
  Classification: HALLUCINATION
  Confidence: 95%
  
  Why it's an outlier:
    • 4x higher than consensus
    • Z-score: 3.8 (extreme deviation)
    • No other model mentions values above 30%
    • Contradicts industry standards
  
  Recommendation: EXCLUDE from final answer
  
  Note: DeepSeek may have confused "markup" with "margin"
  or cited an extreme outlier case.

═══════════════════════════════════════════════════════════════

📊 FINAL ANSWER (excluding outliers)
  "Typical dropshipping profit margins are 15-20%"
  
  Confidence: HIGH (3/3 valid models agree)
  Outliers removed: 1 (hallucination)
```

---

## Advanced: Multi-Stage Outlier Challenge

If an outlier is detected:

1. **Re-query the outlier model** with more specific prompt
2. **Use a tie-breaker model** (o3, Opus) to arbitrate
3. **Check external sources** (MCP search) for ground truth
4. **Final decision**: Include/exclude based on weight of evidence

---

## Summary

The Outlier Isolator:
- ✅ Detects numerical, semantic, and categorical outliers
- ✅ Classifies outlier type (hallucination vs valuable dissent)
- ✅ Automatically excludes bad data from consensus
- ✅ Preserves valuable minority perspectives
- ✅ Creates cleaner, more reliable research outputs

This makes Kno-It **self-correcting** — it learns from its own variance.
