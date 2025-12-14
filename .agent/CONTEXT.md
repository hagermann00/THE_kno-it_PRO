# Kno-It — AI Agent Context

## What Is This Project?

Kno-It is a **standalone multi-LLM research engine**. It's being built separately from Y-IT Machine so it can:
1. Be developed and tested independently
2. Be imported by Y-IT (or other projects) as a module
3. Evolve without breaking Y-IT's stable features

## Owner's Vision

The owner has a specific **multi-iterative research flow** in mind. Key principles:

1. **Multi-LLM First** — The architecture must support multiple providers from the start
2. **Redundant Research** — Multiple engines check each other's work
3. **Cross-Validation** — Flag disagreements, require consensus on critical facts
4. **Modular** — Research logic separate from UI/presentation
5. **Cost-Aware** — Track and display costs per query

## Related Projects

- **Y-IT Machine 2** (`../y-it-machine-2`) — Book/content generation system
  - Will consume Kno-It for research
  - Has its own multi-LLM directive for post-research features
  - See: `../y-it-machine-2/.agent/workflows/y-it-multi-llm-directive.md`

## Current Model Pricing (December 2024/2025)

### Anthropic Claude
| Model | Input $/M | Output $/M |
|-------|-----------|------------|
| claude-3.5-haiku | $0.80 | $4.00 |
| claude-sonnet-4.5 | $3.00 | $15.00 |
| claude-opus-4.5 | $5.00 | $25.00 |

### OpenAI
| Model | Input $/M | Output $/M |
|-------|-----------|------------|
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4o | $2.50 | $10.00 |
| gpt-5 | $1.25 | $10.00 |
| gpt-5-mini | $0.25 | $2.00 |
| o3 | $2.00 | $8.00 |
| o4-mini | $1.10 | $4.40 |

### Google Gemini
| Model | Input $/M | Output $/M |
|-------|-----------|------------|
| gemini-2.5-flash | $0.10 | $0.40 |
| gemini-2.5-flash-lite | $0.10 | $0.40 |
| gemini-2.5-pro (≤200K) | $1.25 | $10.00 |
| gemini-2.5-pro (>200K) | $2.50 | $15.00 |

## Key Design Decisions

1. **Use Claude or GPT to architect** (not Gemini) — neutral perspective for multi-engine design
2. **Gemini for Gemini-specific code** — it knows its own SDK best
3. **MCP for universal tools** — search works with any provider
4. **Provider abstraction layer** — all providers implement same interface

## Research Depth Levels (Planned)

| Level | What It Does | Engines | Est. Cost |
|-------|--------------|---------|-----------|
| Quick | Single pass, single engine | 1 | ~$0.01 |
| Standard | Multi-agent, single engine | 1 | ~$0.05 |
| Verified | Two engines, flag disagreements | 2 | ~$0.15 |
| Deep Dive | Three engines + cross-validation | 3 | ~$0.50-1.00 |

## To Continue Development

1. **Ask the owner** about their multi-iterative vision — they have specific flow in mind
2. **Start with provider abstraction** — this is foundational
3. **Keep it standalone** — no dependencies on Y-IT
4. **Expose clean API** — simple import for consumers

## Files to Read First

- `README.md` — Project overview
- `src/core/types.ts` — Core type definitions (when created)
- `src/providers/LLMProvider.ts` — Abstract provider interface (when created)
