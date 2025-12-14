# Kno-It Project Agent Instructions

## Project Identity
**Name:** Kno-It (The Savage Knowledge Engine)  
**Type:** Multi-LLM Research Intelligence Engine  
**Version:** 0.2.0  
**Repository:** https://github.com/hagermann00/THE_kno-it_PRO

---

## Project Purpose
Kno-It is NOT a passive research tool. It is a **Strategic Intelligence Weapon** designed to:
- Transform an indifferent user into a dominant force in decisive moments
- Provide asymmetric information leverage
- Find *leverage*, *weaknesses*, and *high-value outliers*

**Philosophy:** "Facts are Ammo."

---

## Technology Stack
- **Runtime:** Node.js 20+ with TypeScript 5+
- **Database:** SQLite via `better-sqlite3`
- **LLM Providers:** Gemini, OpenAI, Anthropic, DeepSeek, Groq, Hugging Face, Ollama
- **Package Manager:** npm

---

## Key Files & Architecture

| Path | Purpose |
|------|---------|
| `src/core/types.ts` | Type definitions |
| `src/core/ModelRegistry.ts` | 30+ model definitions with pricing |
| `src/core/ProviderRegistry.ts` | Provider initialization & routing |
| `src/core/StorageEngine.ts` | SQLite persistence layer |
| `src/research/ResearchEngine.ts` | Main orchestrator |
| `src/research/ConsensusEngine.ts` | Statistical agreement analysis |
| `src/research/OutlierIsolator.ts` | Hallucination/dissent detection |
| `src/providers/*.ts` | Individual LLM provider implementations |

---

## Development Commands
```bash
npm install          # Install dependencies
npm run demo "query" # Run CLI demo
npm run dev          # Watch mode
npm run build        # Compile TypeScript
npm run test         # Run tests
```

---

## Environment Variables (.env)
```
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
DEEPSEEK_API_KEY=your-key
GROQ_API_KEY=your-key
```

---

## Agent Behavior Rules

### DO:
- Prioritize free-tier models (Gemini Flash, Groq) for cost efficiency
- Log all research sessions to StorageEngine
- Flag outliers as potential "Alpha" opportunities, not just errors
- Use aggressive "Savage Mode" prompts when requested

### DON'T:
- Never commit `.env` files (contains API keys)
- Never delete `data/*.db` without explicit user approval
- Never auto-run expensive models (o3, Claude Opus) without confirmation

---

## Current Development Phase
**Phase 2: Intelligence Expansion**
- [ ] Wire StorageEngine to ResearchEngine
- [ ] Implement C-Suite Persona modes
- [ ] Build Grounding Switchboard
- [ ] Create React Dashboard (Phase 3)

---

## Related Documents
- `KNO_IT_MASTER_CONTEXT.md` - Full architecture & vision
- `MULTI_AGENT_PLAN.md` - Handoff for multi-agent development
- `ADVANCED_FEATURES.md` - Roadmap for C-Suite, Scoring, Alpha Engine
- `RESTART.md` - Session recovery document
