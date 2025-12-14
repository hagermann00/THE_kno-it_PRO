---
description: Statistical analysis system for multi-model research outputs
---

# Statistical Analysis: Average, Variance, and Derivatives

## The Big Idea

When multiple models research the same topic, we get more than just facts—we get **statistical signals**:

1. **AVERAGE** → Consensus view (what most models agree on)
2. **VARIANCE** → Disagreement patterns (where models differ)
3. **DERIVATIVES** → Meta-insights FROM the variance (the real gold)

---

## Example: "What are dropshipping profit margins in 2024?"

### Raw Model Outputs

```
DeepSeek Chat:     "15-20%"
Gemini Flash:      "10-30%, typically 15-20%"
GPT-4o:            "18-22% for established stores"
Claude Sonnet:     "Highly variable, 10-40% depending on niche"
```

### Traditional Approach (Boring)
Pick one answer or say "models disagree."

### Kno-It Statistical Approach (Powerful)

#### 1. AVERAGE (Consensus)
```
Numerical Analysis:
- Mean:   18.75%
- Median: 17.5%
- Mode:   15-20% range (mentioned by 3/4 models)

Consensus: "15-20% is the most commonly cited range"
```

#### 2. VARIANCE (Disagreement Map)
```
Standard Deviation: ±8.5%
Range Spread:       10-40%

Disagreement Factors:
- "Niche dependency" (mentioned by Claude)
- "Established vs new stores" (mentioned by GPT-4o)
- Time period ambiguity (2024 vs historical)

Variance Interpretation: HIGH
→ This metric is context-sensitive, not universal
```

#### 3. DERIVATIVES (Meta-Insights) ⭐
```
Insight #1: Context Matters
- Models that gave ranges mentioned "depends on niche"
- Models that gave point estimates assumed "typical case"
→ DERIVATIVE: Profit margin is NOT a single number—it's a distribution

Insight #2: Knowledge Cutoff Bias
- Newer models (GPT-5, Claude 4.5) cite tighter ranges
- Older data might include pandemic outliers
→ DERIVATIVE: 2024 data suggests convergence toward 15-20%

Insight #3: Confidence Pattern
- Models with higher variance used qualifiers ("highly variable", "typically")
- Models with lower variance stated numbers confidently
→ DERIVATIVE: Uncertainty is part of the answer; confident models may be oversimplifying

Insight #4: Question Ambiguity Detection
- Models interpreted "profit margin" differently (gross vs net)
- No model asked for clarification
→ DERIVATIVE: The question itself needs refinement
```

---

## Statistical Output Format

### For Each Fact/Claim:

```typescript
interface StatisticalFact {
  claim: string;

  // AVERAGE
  consensus: {
    value: string;              // "15-20%"
    confidence: number;         // 0.75 (3/4 models agree)
    agreementCount: number;     // 3
    totalModels: number;        // 4
  };

  // VARIANCE
  variance: {
    spread: string;             // "10-40%"
    standardDeviation?: number; // For numerical values
    disagreementFactors: string[]; // ["niche", "timeframe", "store age"]
    level: 'low' | 'medium' | 'high';
  };

  // DERIVATIVES (Meta-Insights)
  derivatives: {
    insights: string[];         // ["Context matters", "Question ambiguous"]
    hiddenAssumptions: string[]; // ["Assumes established store"]
    confidenceFlag: 'certain' | 'conditional' | 'uncertain';
    actionableRecommendation: string; // "Ask follow-up: B2B or B2C niche?"
  };

  // RAW DATA
  modelOutputs: {
    model: string;
    response: string;
    confidence?: number;
  }[];
}
```

---

## Derivative Pattern Detection

### Pattern 1: Convergent Confidence
**Signal:** All models give same answer
**Derivative:** This is likely objectively true
**Example:** "Water freezes at 0°C" → 100% agreement → High confidence

### Pattern 2: Divergent Ranges
**Signal:** Models give overlapping but different ranges
**Derivative:** True value is likely a distribution, not a point
**Example:** "15-20%", "10-30%" → Derivative: "Typical range 15-20%, outliers 10-40%"

### Pattern 3: Conditional Splits
**Signal:** Models cite different answers based on unstated conditions
**Derivative:** The question has hidden variables
**Example:**
- Model A: "Shopify is best"
- Model B: "WooCommerce is best"
→ Derivative: "Platform choice depends on [tech stack / budget / scale]"

### Pattern 4: Temporal Disagreement
**Signal:** Newer models contradict older models
**Derivative:** This fact is time-sensitive or recently changed
**Example:**
- GPT-4 (2023 cutoff): "Twitter has 400M users"
- GPT-5 (2024 cutoff): "X has 500M users"
→ Derivative: "Rapid growth OR rebranding changed metrics"

### Pattern 5: Confidence Inverse Correlation
**Signal:** Most confident model is the outlier
**Derivative:** Overconfidence flag—verify this source
**Example:**
- 3 models: "maybe 15-20%"
- 1 model: "DEFINITELY 25%"
→ Derivative: "The certain answer is probably wrong"

---

## Implementation: Consensus Algorithm

```typescript
class ConsensusEngine {

  /**
   * Stage 1: AVERAGE - Find common ground
   */
  calculateConsensus(responses: ModelResponse[]): Consensus {
    // For text: Longest common substring / semantic similarity
    // For numbers: Mean, median, mode
    // For categories: Voting / frequency analysis
  }

  /**
   * Stage 2: VARIANCE - Map disagreements
   */
  analyzeVariance(responses: ModelResponse[]): Variance {
    // Detect outliers
    // Categorize disagreement types (numerical, categorical, temporal)
    // Extract context clues from each response
  }

  /**
   * Stage 3: DERIVATIVES - Extract meta-insights
   */
  deriveInsights(consensus: Consensus, variance: Variance): Derivative[] {
    const insights: Derivative[] = [];

    // Pattern: Low variance → High confidence
    if (variance.level === 'low') {
      insights.push({
        type: 'confidence',
        message: 'Strong consensus across models',
        reliability: 'high'
      });
    }

    // Pattern: High variance + conditional language → Context-dependent
    if (variance.level === 'high' && hasConditionalLanguage(responses)) {
      insights.push({
        type: 'context-dependency',
        message: 'Answer depends on unstated variables',
        recommendation: 'Refine query with specific context'
      });
    }

    // Pattern: Numerical spread → Distribution insight
    if (isNumerical(responses) && variance.spread > THRESHOLD) {
      insights.push({
        type: 'distribution',
        message: 'Value is a range, not a single number',
        range: calculateRange(responses)
      });
    }

    return insights;
  }
}
```

---

## UI Output Example

```
Query: "What are dropshipping profit margins in 2024?"

═══════════════════════════════════════════════════════════════

📊 CONSENSUS (AVERAGE)
  Most likely answer: 15-20%
  Agreement: 3/4 models (75%)

📈 VARIANCE ANALYSIS
  Range spread: 10-40%
  Disagreement level: HIGH
  Key factors causing variance:
    - Niche type (fashion vs electronics)
    - Store maturity (new vs established)
    - Metric definition (gross vs net margin)

🔬 DERIVATIVE INSIGHTS

  ⚠️ Context Alert
  This metric is highly context-dependent. The "average" hides
  important nuance.

  💡 Hidden Assumption Detected
  Most models assumed "established dropshipping store." For new
  stores, expect 5-10% until optimized.

  🎯 Actionable Recommendation
  Refine your question:
    - "What niche?" → Fashion: 10-15%, Electronics: 20-30%
    - "Your experience?" → First 6mo: 5-10%, After 1yr: 15-25%

  📉 Confidence Pattern
  Models citing specific numbers were LESS confident (used
  qualifiers). Trust the ranges more than point estimates.

═══════════════════════════════════════════════════════════════

💬 Model-by-Model Breakdown

  DeepSeek Chat: "15-20%"
    → No caveats, assumed typical case

  Gemini Flash: "10-30%, typically 15-20%"
    → Acknowledged variance, gave range

  GPT-4o: "18-22% for established stores"
    → Added context (established stores)

  Claude Sonnet: "Highly variable, 10-40% depending on niche"
    → Most cautious, highlighted dependency

═══════════════════════════════════════════════════════════════

💰 Research Cost: $0.18
⏱️  Time: 52 seconds
🤖 Models Used: 4 (DeepSeek, Gemini, GPT-4o, Claude)
```

---

## Why This Is Powerful

Traditional approach: "Models disagree, so we're uncertain."
**Kno-It approach:** "Models disagree in THIS SPECIFIC WAY, which tells us X, Y, Z."

The **variance itself is data**. The **pattern of disagreement is insight**.

---

## Next Implementation Steps

1. Build `ConsensusEngine` class
2. Implement variance detection algorithms
3. Create derivative pattern matchers
4. Design statistical output UI
5. Add confidence scoring system

---

This is the killer feature that makes Kno-It more than a wrapper—it's a meta-research intelligence layer.
