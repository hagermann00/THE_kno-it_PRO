# Kno-It Advanced Meta-Cognition Roadmap

## 1. "C-Suite" Counsel Modes
**Objective:** Create distinct persona iterations for the Research Engine to view problems from different strategic angles.

- **The CFO (Risk Officer):** Hyper-conservative, focuses on downside, costs, and variance.
- **The CTO (Visionary):** Focuses on technical feasibility, future-proofing, and theoretical limits.
- **The CEO (Executive):** Synthesizes information into actionable "bottom line" decisions.
- **The Devil's Advocate:** Specifically prompted to find flaws in the Consensus.

## 2. Model Multi-Vector Dynamic Scoring
**Objective:** A "Credit Score" for each LLM based on its performance over time.

### The Scoring Vectors:
1.  **Consensus Alignment (The "Safe" Score):** How often does the model agree with the group majority?
2.  **Unique Insight Rate (The "Alpha" Score):** How often does it provide a unique fact that is LATER verified as true?
3.  **Hallucination Rate (The "Penalty" Score):** Frequency of finding completely fabricated sources.
4.  **Formatting Adherence (The "Cleanliness" Score):** Does it break JSON struct or fail constraints?

### Implementation Strategy:
- **Db Store:** Create a local SQLite/JSON log of every claim made by every model.
- **Post-Hoc Analysis:** Validated facts update the scores.
- **Dynamic Weighting:** In future queries, "High Alpha" models get more voting power in the Consensus Engine.

## 3. Hallucination & Reliability Quotient
**Objective:** Keep a permanent record of failures.

- **The "Penalty Box":** If a model hallucinates > X times in a session, it is temporarily suspended from the consensus pool.
- **Documentation:** Create `HALLUCINATION_LOG.md` to track specific failures (e.g., "Gemini often invents 2024 dates", "Groq truncates large numbers").

## 4. The "High-Value Outlier" Isolator (The Gambling/Alpha Engine)
**Objective:** Distinguish between a *Mistake* and a *Hidden Gem*.

**The Theory:** 
- If Models A, B, C say "X is True".
- Model D says "X is False because of obscure reason Y".
- **Standard Logic:** discard D as error.
- **Alpha Logic:** Investigate Y. If Y exists, D is the *most valuable* model.

**Action Plan:**
- **Verification Step:** When a dissent occurs, spawn a specific "Verify this claim" sub-agent using a Search Tool.
- **Profit Probability:** If the dissent is verified true, flag as "HIGH VARIANCE OPPORTUNITY".
