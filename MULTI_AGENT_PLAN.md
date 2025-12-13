# Multi-Agent Development Plan for Agent Manager

## Phase 1: Knowledge & Memory Infrastructure (The Foundation)
**Objective:** Establish a low-overhead, CPU-friendly knowledge store that acts as both long-term memory and an intelligent cache to reduce API costs and latency.

### 1. The Storage Agent (Database Engineer)
*   **Role:** Architect the "Brain Stem".
*   **Task:** Implement SQLite with JSON support (NoSQL-like flexibility, SQL reliability).
*   **Why SQLite?** It runs in-process, uses minimal CPU, requires zero server setup, and is incredibly fast for millions of records. Perfect for "CPU-only" constraints.
*   **Deliverable:** `StorageEngine` class with methods: `logResearch()`, `retrieveRelevant()`, `checkCache()`.

### 2. The Vector Agent (The Indexer)
*   **Role:** Build the "Association Cortex".
*   **Task:** Implement *lightweight* vector search.
*   **Strategy:** Instead of heavy Python/PyTorch vector databases (Pinecone/Milvus) which kill CPUs, use **Node-native libraries** (like `usearch` or `closevector`) or simply use **Gemini Embeddings API** (Free Tier) to generate vectors and store them as blobs in SQLite.
*   **CPU Hack:** We offload the *calculation* (embedding generation) to the API. We only do the *storage* and simple distance checks locally.
*   **Answer to User Question:** **YES, a Vector Database works perfectly as a Semantic Cache.**
    *   *Scenario:* User asks "Solar panel efficiency".
    *   *Cache Check:* System converts question to vector. Finds similar previous question "Photovoltaic performance 2024" (95% match).
    *   *Result:* Returns stored answer instantly. Zero API cost. Zero wait time.

## Phase 2: The "Switchboard" Logic (Backend Expansion)

### 3. The Routing Agent (The Switchboard Operator)
*   **Role:** Implement the "Grounding & Capability" logic.
*   **Task:** Update `ModelRegistry` to track capabilities explicitly:
    *   `canGround`: boolean (Can access live web?)
    *   `specialty`: enum ('creative', 'analytical', 'coding', 'unfiltered')
*   **Deliverable:** A `Router` class that intercepts queries. "Needs live data?" -> Send to Gemini/Perplexity. "Needs analysis?" -> Send to Claude.

### 4. The Persona Agent (The Casting Director)
*   **Role:** Implement C-Suite and Counsel modes.
*   **Task:** Create a `PersonaRegistry`.
*   **Deliverable:** Middleware that wraps user queries in specific system prompts ("You are the CFO...") before sending to the LLM.

## Phase 3: Interface & Execution (Frontend)

### 5. The Frontend Agent (UI/UX Developer)
*   **Role:** Build the Visual Command Center.
*   **Framework:** React + Vite (Speed & Modernity).
*   **Deliverable:** A dashboard showing:
    *   Live Model Status (Thinking/Done).
    *   The "Switchboard" (Toggles for Grounding, Personas).
    *   The "Arena" (Side-by-side answers).
    *   "Savage Mode" Toggle.

---

## Recommended Workflow for You (The User)

1.  **Assign Phase 1 (Storage)** first. This gives us a place to put all future data (the "Bulk Knowledge" you mentioned).
2.  **Assign Phase 2 (Routing & Persona)** next. This builds the intelligent "muscles".
3.  **Assign Phase 3 (UI)** last. This gives you the control panel.

**Immediate To-Do:**
- [ ] Create `StorageEngine` (SQLite Setup).
- [ ] Implement "Semantic Caching" logic (Vector matching).
- [ ] Populate `.env` keys.
