# KNO-IT: The Savage Knowledge Engine
**Master Context & Architecture Document**
**Date:** December 13, 2024
**Status:** Active Development (Phase 2: Intelligence Expansion)

---

## 1. The Vision: "Savage Knowledge"
Kno-It is not a passive search tool. It is a **Strategic Intelligence Weapon** designed to transform an indifferent user into a dominant force in any decisive moment.
*   **Goal:** Provide asymmetric information leverage.
*   **Philosophy:** "Facts are Ammo." We don't just find answers; we find *leverage*, *weaknesses*, and *high-value outliers*.

---

## 2. System Architecture

### 2.1 Current State: "The Hybrid Backend"
The system currently exists as a powerful Node.js/TypeScript backend logic engine.
*   **Core:** `ResearchEngine.ts` orchestrates multi-model queries.
*   **Analysis:** `ConsensusEngine.ts` calculates truth probabilities and variances.
*   **Memory:** `StorageEngine.ts` (SQLite) provides local persistence and cloud backups.
*   **Providers:** Full integration with Anthropic, Gemini, OpenAI, DeepSeek, Groq, and Hugging Face.

### 2.2 Target State: "The Command Center" (React/Visual)
We are moving toward a visual dashboard (React/Next.js) that acts as a **Switchboard**:
*   **Live Controls:** Toggle "Savage Mode", "C-Suite Personas", "Grounding".
*   **The Arena:** Visual comparison of model outputs.
*   **Browser Bridge:** "Sidecar" integration to leverage existing authenticated browser sessions.

---

## 3. Feature Inventory

### ✅ Completed (Foundation)
*   **Multi-Provider Registry:** Agnostic handling of all major LLM APIs.
*   **Free-Tier Optimization:** Logic to route queries to free models (Gemini Flash, Groq).
*   **Consensus Algorithm:** Statistical analysis of model agreement.
*   **Outlier Isolation:** Identifying distinct minority opinions.
*   **Storage Architecture:** `better-sqlite3` local DB with Multi-Cloud Backup (OneDrive/Google Drive).

### 🚧 In Progress (The "Savage" Upgrade)
*   **Savage Mode:** Aggressive system prompts focusing on leverage/ambiguity.
*   **Alpha Engine:** Reframing "contradictions" as "profit/exploitation opportunities".
*   **Grounding Switchboard:** Explicit routing for queries needing live web data.

### 📅 Planned (The Roadmap)
*   **C-Suite Personas:** "CFO" (Risk), "Visionary" (Growth), "Devil's Advocate".
*   **Semantic Caching:** Using vectors to answer repeated questions instantly (Zero Cost).
*   **Frontend Dashboard:** React-based visual interface.

---

## 4. Multi-Agent Development Plan

To scale development, we have split the project into three autonomous "Agent Tracks":

### 🔹 Track 1: The Storage Agent (Memory)
*   **Focus:** SQLite Implementation, Vector/Semantic Caching.
*   **Goal:** "Never lose a thought. Never pay for the same answer twice."
*   **Status:** Initial Engine created (`src/core/StorageEngine.ts`). Needs wiring to `index.ts`.

### 🔹 Track 2: The Routing Agent (Intelligence)
*   **Focus:** `PersonaRegistry`, `GroundingSwitchboard`, "Savage Mode" logic.
*   **Goal:** "The right brain for the right fight." routing creative tasks to Claude, factual to Gemini.
*   **Status:** Design phase. `ADVANCED_FEATURES.md` created.

### 🔹 Track 3: The Frontend Agent (Interface)
*   **Focus:** React/Next.js Dashboard.
*   **Goal:** "The War Room." A visual command center for the user.
*   **Status:** Pending.

---

## 5. Technical Constraints & Specifications
*   **Hardware:** CPU-Only Environment (No heavy local LLMs/Quantization).
*   **Strategy:** Offload compute to Cloud APIs (Free Tier) wherever possible.
*   **Storage:** Local NVMe for speed (`./data/*.db`), Cloud for safety (OneDrive Sync).
*   **Dependencies:** `better-sqlite3` (DB), `dotenv` (Config), `zod` (Validation).

---

## 6. Immediate Next Steps / TODOs
1.  **Wire up Memory:** Integrate `StorageEngine` into `ResearchEngine` to log all queries.
2.  **Activate Savage Mode:** Implement the prompt overrides in `ResearchEngine.ts`.
3.  **Frontend Bootstrap:** Initialize the React Dashboard project.

---

*This document serves as the Source of Truth for the Kno-It project.*
