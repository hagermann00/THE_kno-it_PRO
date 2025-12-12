# Kno-It

> Multi-LLM Research Intelligence Engine

A standalone, modular research system that orchestrates multiple AI providers (Gemini, OpenAI, Anthropic) for deep, redundant, cross-validated research.

## Vision

Kno-It is designed to be:
- **Standalone** — Works independently as a research tool
- **Modular** — Can be imported by other projects (like Y-IT Machine)
- **Multi-Engine** — Leverages multiple LLMs for consensus and validation
- **Redundant** — Cross-checks facts across providers to catch hallucinations

## Features (Planned)

- [ ] Multi-LLM Provider Layer (Gemini, OpenAI, Anthropic)
- [ ] Model Registry with live pricing
- [ ] Deep Research Mode (multi-pass, multi-agent)
- [ ] Cross-Validation / Consensus Engine
- [ ] Disagreement Flagging
- [ ] MCP Tool Integration (universal search)
- [ ] Cost Estimation
- [ ] Simple CLI / UI for standalone use

## Architecture

```
kno-it/
├── src/
│   ├── core/           # Provider abstraction, registry
│   ├── providers/      # Gemini, OpenAI, Anthropic implementations
│   ├── research/       # Agents, orchestration, consensus
│   ├── mcp/            # MCP tool integration
│   └── index.ts        # Clean API export
├── .agent/             # AI context and workflows
└── package.json
```

## Usage (Planned)

```typescript
import { ResearchEngine } from 'kno-it';

const engine = new ResearchEngine({
  depth: 'verified',          // quick | standard | verified | deep-dive
  primaryModel: 'gemini-2.5-flash',
  validationModel: 'claude-sonnet-4.5',
});

const results = await engine.investigate("Dropshipping ROI 2024");

console.log(results.confirmed);     // Facts all engines agree on
console.log(results.disputed);      // Disagreements flagged
console.log(results.sources);       // Source URLs
console.log(results.costBreakdown); // What it cost
```

## Integration with Y-IT

Y-IT Machine can import Kno-It as a module:

```typescript
// In Y-IT
import { ResearchEngine } from '../kno-it';
// or
import { ResearchEngine } from 'kno-it'; // if published to npm
```

## Development

```bash
cd kno-it
npm install
npm run dev
```

## License

Proprietary — Y-OS Project
