# Kno-It Research Presets

## Research Workflow Design Document

---

## Preset: 💰 **Budget** (Quick & Cheap)

**Goal:** Fast, single-source research for low-stakes queries  
**Cost:** ~$0.01-0.05  
**Time:** 10-30 seconds

### Flow:
1. **Single Model:** DeepSeek Chat (cheapest)
2. **Single Pass:** One comprehensive query
3. **Output:** Simple facts list + sources

### Use Cases:
- Quick fact-checking
- Initial topic exploration
- Non-critical research

---

## Preset: ⚖️ **Balanced** (Standard Research)

**Goal:** Reliable research with basic validation  
**Cost:** ~$0.10-0.20  
**Time:** 30-60 seconds

### Flow:
1. **Primary Model:** Gemini 2.5 Flash
   - Broad research query
   - Extract key facts
2. **Validation:** GPT-4o Mini
   - Verify top 5 claims
   - Check for contradictions
3. **Synthesis:** Claude 3.5 Haiku
   - Combine findings
   - Flag any discrepancies

### Output:
- Confirmed facts (both agreed)
- Flagged items (disagreement)
- Source URLs
- Cost breakdown

### Use Cases:
- Blog post research
- Business reports
- Academic papers (preliminary)

---

## Preset: ✓ **Verified** (Cross-Validation)

**Goal:** High-confidence research with redundancy  
**Cost:** ~$0.30-0.50  
**Time:** 1-2 minutes

### Flow:
1. **Round 1 - Parallel Research:**
   - Model A: Gemini 2.5 Flash
   - Model B: GPT-4o
   - Both run same query independently
   
2. **Fact Extraction:**
   - Parse each response for discrete claims
   - Tag each claim with source model
   
3. **Consensus Check:**
   - Claims both models agree on → **CONFIRMED** ✅
   - Claims only one model found → **UNIQUE** ⚠️
   - Claims that contradict → **DISPUTED** ❌
   
4. **Dispute Resolution (if any):**
   - Claude Sonnet 4.5 acts as "tie-breaker"
   - Reviews disputed claims with source context
   - Makes final determination

### Output:
```
CONFIRMED (15 facts)
  - Dropshipping profit margins: 15-20%
  - Agreed by: gemini-2.5-flash, gpt-4o
  - Sources: [url1], [url2]

UNIQUE (3 facts)
  - Average customer acquisition cost: $25
  - Found by: gemini-2.5-flash only
  - Confidence: MEDIUM

DISPUTED (1 fact)
  - "Best platforms for dropshipping"
  - gemini-2.5-flash says: Shopify, WooCommerce
  - gpt-4o says: Shopify, BigCommerce
  - Resolved by: claude-sonnet-4.5
  - Final answer: Shopify (unanimous), WooCommerce vs BigCommerce (market-dependent)
```

### Use Cases:
- High-stakes business decisions
- Medical/legal research (preliminary)
- Fact-checking controversial topics

---

## Preset: 🔬 **Deep Dive** (Maximum Rigor)

**Goal:** Exhaustive, multi-angle research with full validation  
**Cost:** ~$1.00-3.00  
**Time:** 3-5 minutes

### Flow:
1. **Round 1 - Triple Parallel Research:**
   - Fast: DeepSeek Chat
   - Balanced: Gemini 2.5 Flash
   - Premium: Claude Sonnet 4.5
   
2. **Specialized Agents (Multi-Pass):**
   - **Detective Agent** (GPT-4o): "Find all facts about X"
   - **Skeptic Agent** (Claude Sonnet 4.5): "What's wrong with these claims?"
   - **Insider Agent** (Gemini 2.5 Pro): "What are experts saying?"
   
3. **Consensus Matrix:**
   ```
   Fact: "Dropshipping profit margin is 15-20%"
   - DeepSeek:  ✅ Agrees
   - Gemini:    ✅ Agrees
   - Claude:    ✅ Agrees
   - Detective: ✅ Found supporting evidence
   - Skeptic:   ⚠️ "Range is volatile, depends on niche"
   - Insider:   ✅ "Industry standard for established stores"
   
   Confidence: HIGH (5/6 agree, 1 caveat)
   ```
   
4. **Cross-Validation:**
   - OpenAI o3 (reasoning model) reviews ALL claims
   - Performs logical consistency check
   - Identifies gaps or contradictions
   
5. **Final Synthesis:**
   - GPT-5 or Claude Opus 4.5
   - Writes comprehensive report
   - Includes confidence scores
   - Lists assumptions and caveats

### Output:
- Executive summary
- Confirmed facts (with confidence scores)
- Disputed facts (with all perspectives)
- Unique insights (single-source)
- Research gaps identified
- Full source bibliography
- Cost and model usage breakdown

### Use Cases:
- Investment due diligence
- Academic thesis research
- Legal case preparation
- Medical research (non-clinical)

---

## Preset: ⚡ **Flash** (Instant Answer)

**Goal:** Fastest possible result  
**Cost:** ~$0.005  
**Time:** 5-10 seconds

### Flow:
1. **Single Model:** Gemini 2.5 Flash Lite
2. **No validation**
3. **Direct answer only**

### Use Cases:
- Quick definitions
- Simple calculations
- Basic fact lookups

---

## Preset: 🎯 **Custom**

**Goal:** User-defined workflow  
**User Configures:**
- Which models to use
- Number of passes
- Validation strategy
- Budget limit

---

## Implementation: Research Depth Types

```typescript
type ResearchDepth = 
  | 'flash'      // Single model, no validation
  | 'budget'     // Single model, basic validation
  | 'balanced'   // Two models, cross-check
  | 'verified'   // Three models, consensus
  | 'deep-dive'  // Six models, multi-pass, full rigor
  | 'custom';    // User-defined
```

---

## Cost Comparison Table

| Preset | Models Used | Queries | Est. Cost | Time | Best For |
|--------|-------------|---------|-----------|------|----------|
| Flash | 1 | 1 | $0.005 | 5s | Quick facts |
| Budget | 1 | 1 | $0.02 | 20s | Low-stakes research |
| Balanced | 3 | 3 | $0.15 | 45s | Standard research |
| Verified | 4 | 6 | $0.40 | 90s | High-confidence needs |
| Deep Dive | 6 | 10+ | $2.00 | 4min | Critical decisions |

---

## Next Steps

1. Implement `ResearchEngine` class
2. Create agent strategies for each preset
3. Build consensus/validation logic
4. Add cost prediction UI
5. Create simple CLI for testing

---

*This design leverages Kno-It's 21-model registry to create intelligent research workflows that balance cost, speed, and reliability.*
