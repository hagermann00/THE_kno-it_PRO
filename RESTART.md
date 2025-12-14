# Kno-It Restart Context
**Version:** v0.2.1 "Dynamic & Auto-Healing"
**Last Updated:** Dec 14, 2025 (03:00 AM CST)
**Status:** STABLE

---

## 🚀 Quick Start
1. **Start Backend API:** (`npm run server`) - Serves the engine at `localhost:3000`
2. **Start Dashboard:** (`cd dashboard && npm run dev`) - UI at `localhost:5173`
3. **Design Research:** (`npm run architect`) - Interactive Workflow Designer (New!)

## 💎 Key Capabilities (New)
- **Auto-Replace:** If a provider fails (402 Payment / 429 Rate Limit), the engine automatically swaps in a backup provider (Gemini/Groq/OpenAI) to complete the squad.
- **Strict Typing:** The codebase is now TypeScript strict. No `as any` hacks.
- **Trust Score:** Every result has a `score` (0-100) and `variance` analysis.

## 🛠️ Debugging
- Logs are in `data/research.db` (SQLite).
- To test CLI without UI: `npm run demo "Your Query"`
- To run completely free: set `USE_MOCK=true` in `.env` OR only provide Gemini/Groq keys.

## ⚠️ Known Config Notes
- `.env` requires valid keys for the models requested.
- If `gpt-4o` is requested but key is broke, it WILL fallback to Gemini/Groq automatically now.
