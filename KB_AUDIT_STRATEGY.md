# Kno-It Knowledge Base Audit Strategy
## "Smart Conflict Caching Protocol"

### 1. Objective
Ensure the Knowledge Base (KB) is strictly factual without incurring prohibitive costs from external "Fact Check" APIs (Perplexity/Sonar).

### 2. The Problem
- **Redundancy:** Distributed components often generate overlapping partial truths.
- **Cost:** External verification is ~$0.01 per query.
- **Scale:** A 10,000 fact KB would cost $100/run to verify bruteforce.

### 3. The Protocol

#### Phase 1: Internal Consensus (Cost: $0.00)
- Use `ConsensusEngine` (already built).
- If `TrustScore >= 80%`: **AUTO-VALIDATE**. (Do not call external API).
- If `TrustScore < 50%`: **FLAG FOR AUDIT**.

#### Phase 2: Hash Caching (The "One-Time Pay" Rule)
- Before any external call, Compute `Hash = SHA256(normalized_claim)`.
- Check `audit_cache` table in SQLite.
- **HIT:** Return cached verdict. Cost: $0.00.
- **MISS:** Proceed to Phase 3.

#### Phase 3: Batched External Audit
- Group flagged claims by `Topic`.
- Bundle 5-10 claims into a single Prompt:
  > "Verify the following 10 conflicting claims. For each, return TRUE/FALSE and a citation."
- Call Perplexity/Sonar API.
- **Store Result in Cache.**

### 4. Database Schema Requirements

```sql
CREATE TABLE audit_cache (
    claim_hash TEXT PRIMARY KEY,
    claim_text TEXT,
    verdict TEXT,      -- 'verified', 'debunked', 'nuanced'
    citation_url TEXT,
    timestamp INTEGER,
    expires_at INTEGER -- Cache valid for 30-90 days
);
```

### 5. Implementation Roadmap
1. [x] Trust Scoring System (Completed)
2. [ ] Create `audit_cache` table.
3. [ ] Build `ExternalAuditor` class with Batching Logic.
4. [ ] Connect to `Perplexity` or `Google Grounding` API.
