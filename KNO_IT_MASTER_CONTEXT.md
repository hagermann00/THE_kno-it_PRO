# KNO-IT: The Savage Knowledge Engine
**Master Context & Architecture Document**

## 1. Project Status
**Current Version:** v0.3.0 "The Book of Truth"
**Date:** December 14, 2025
**Status:** FULLY OPERATIONAL (Research Protocols Active)

### Recent Accomplishments (v0.3.x)
- [x] **Master Protocols:** "Book of Truth," "Savage Mode," and "Deep Dive" presets active.
- [x] **Semantic Caching:** Zero-cost processing for repeated or similar queries (`text-embedding-004`).
- [x] **Future-Proof Archival:** Auto-generation of Markdown artifacts with YAML metadata for future RAG consumption.
- [x] **Cloud Integration:** Zero-Config Google Drive backup of both DB and Artifacts.
- [x] **Ephemeral Workspace:** `data/working` for inter-agent scratchpads and debugging.
- [x] **Budget Awareness:** Dynamic model fallback (Grade A -> Grade B) based on cost caps.

### Immediate Next Steps (Phase 4)
1.  **Frontend Dashboard:** React-based visual interface (Active Development).
2.  **kb-it Module:** Design the upstream knowledge base that ingests the `data/canvas` and `artifacts` folder.
3.  **Git Archival:** Automate pushing artifacts to a private repository for version control.

---

## 2. The Vision: "Savage Knowledge"
Kno-It is not a passive search tool. It is a **Strategic Intelligence Weapon** designed to transform an indifferent user into a dominant force in any decisive moment.
*   **Goal:** Provide asymmetric information leverage.
*   **Philosophy:** "Facts are Ammo." We don't just find answers; we find *leverage*, *weaknesses*, and *high-value outliers*.

---

## 3. System Architecture

### 3.1 Current State: "The Hybrid Backend"
The system currently exists as a powerful Node.js/TypeScript backend logic engine.
*   **Core:** `ResearchEngine.ts` orchestrates multi-model queries using specific protocols (e.g., `y-it`).
*   **Analysis:** `ConsensusEngine.ts` calculates truth probabilities and variances.
*   **Memory:** `StorageEngine.ts` (SQLite) + **Artifact System** (Markdown/YAML).
*   **Providers:** Gemini (Flash/Pro/Embeddings), OpenAI, Anthropic, DeepSeek, Groq (Llama 3.3).

### 3.2 Target State: "The Command Center" (React/Visual)
We are moving toward a visual dashboard (React/Next.js) that acts as a **Switchboard**:
*   **Live Controls:** Toggle "Savage Mode", "C-Suite Personas", "Grounding".
*   **The Arena:** Visual comparison of model outputs.
*   **Browser Bridge:** "Sidecar" integration to leverage existing authenticated browser sessions.

---

## 4. Feature Inventory

### ✅ Completed (Foundation)
*   **Multi-Provider Registry:** Agnostic handling of all major LLM APIs.
*   **Free-Tier Optimization:** Logic to route queries to free models (Gemini Flash, Groq).
*   **Consensus Algorithm:** Statistical analysis of model agreement.
*   **Outlier Isolation:** Identifying distinct minority opinions.
*   **Storage Architecture:** `better-sqlite3` local DB with Multi-Cloud Backup (OneDrive/Google Drive).
*   **Artifact Generation:** Creating "Smart Files" for future ingestion.
*   **Semantic Search:** Vector-based cache retrieval.

### 🚧 In Progress (The "Savage" Upgrade)
*   **Frontend Dashboard:** React-based visual interface.
*   **KB-IT:** Dedicated Knowledge Base module.

---

## 5. Multi-Agent Development Plan

### 🔹 Track 1: The Storage Agent (Memory) - [COMPLETE]
*   **Focus:** SQLite Implementation, Vector/Semantic Caching, Artifact Archival.
*   **Status:** Operational. `StorageEngine` handles DB syncing and Markdown generation.

### 🔹 Track 2: The Routing Agent (Intelligence) - [COMPLETE]
*   **Focus:** `PersonaRegistry`, `GroundingSwitchboard`, "Savage Mode" logic.
*   **Status:** Operational. "Y-It Master Protocol" deployed.

### 🔹 Track 3: The Frontend Agent (Interface) - [ACTIVE]
*   **Focus:** React/Next.js Dashboard.
*   **Goal:** "The War Room." A visual command center for the user.
*   **Status:** Pending.

---

## 6. Technical Constraints & Specifications
*   **Hardware:** CPU-Only Environment (No heavy local LLMs/Quantization).
*   **Strategy:** Offload compute to Cloud APIs (Free Tier) wherever possible.
*   **Storage:** Local NVMe for speed (`./data/*.db`), Cloud for safety (OneDrive Sync), Git for Versioning (Planned).
*   **Dependencies:** `better-sqlite3` (DB), `dotenv` (Config), `zod` (Validation).

---

## 7. Immediate Next Steps / TODOs
1.  **Frontend Bootstrap:** Initialize the React Dashboard project.
2.  **Git Integration:** Hook `StorageEngine` to `git commit` for artifact versioning.
3.  **Expand Prompts:** Add more specific protocols for Tech Review, Code Audit, etc.

---

*This document serves as the Source of Truth for the Kno-It project.*
