# Kno-It Restart Context
**Version:** v0.2.0 "Dynamic Simulation"
**Last Updated:** 2025-12-13
**Status:** PRODUCTION READY (Local)

---

## 🚀 Quick Start
1. **Start Backend API:**
   ```bash
   npm run server
   ```
2. **Start Dashboard (New Terminal):**
   ```bash
   cd dashboard
   npm run dev
   ```

## 🛠️ System State

### 1. New Features (v0.2.0)
- **Dynamic Squads:** Boardroom, FutureCast, Yes/No/Maybe, Competency, Generational.
- **Trust Scoring:** Automated 0-100% confidence rating based on consensus math.
- **Audit Cache:** Passive SQL infrastructure to store external fact checks (cost optimization).
- **Command Center:** React + Tailwind UI with "Savage Mode" theme.
- **Backend API:** Express server at `localhost:3000/api/research`.

### 2. Core Components
- **ConsensusEngine:** Calculates score, variances, and contradictions.
- **ResearchEngine:** Orchestrates multi-model workflows.
- **StorageEngine:** Logs all runs with `persona` context for future evaluation.
- **PersonaRegistry:** Defines all System Prompts for Squads.

### 3. Immediate Next Steps (Phase 3)
1. **Feature Flag: Perplexity Sonar Pro:** Implement `ExternalAuditor` to use the `audit_cache`.
2. **Eval UI:** Build a page to view past logs and manually grade them (for KB tuning).

## ⚠️ Critical Files
- `src/core/PersonaRegistry.ts`: Logic for Squads/Roles.
- `src/research/ConsensusEngine.ts`: Logic for Trust Scoring.
- `src/core/StorageEngine.ts`: Logic for Logging & Caching.
- `KB_AUDIT_STRATEGY.md`: Strategy for cost-effective fact checking.

## 🔐 Credentials
- `.env` must be present (not in git).
- API Keys required: Gemini (free), others optional.

---
**Agent Instruction:** Use `KB_AUDIT_STRATEGY.md` when implementing the external audit feature.
