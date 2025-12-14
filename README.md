# Kno-It: Multi-LLM Research Intelligence Engine

**Complete.** Now fully functional with 6 research presets, statistical analysis, and outlier detection.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your API keys to .env

# Run demo
npm run demo "dropshipping profit margins 2024"
```

## Features

### ✅ 6 Research Presets

| Preset | Models | Cost | Time | Best For |
|--------|--------|------|------|----------|
| Flash | 1 | ~$0.005 | 5s | Quick facts |
| Budget | 1 | ~$0.02 | 20s | Low-stakes research |
| Quick | 1 | ~$0.05 | 30s | Fast single-source |
| Standard | 3 | ~$0.15 | 45s | Reliable multi-source |
| Verified | 4 | ~$0.40 | 90s | High-confidence |
| Deep Dive | 6+ | ~$2.00 | 4min | Critical decisions |

### ✅ Statistical Analysis

**Average**: Consensus calculation across models
**Variance**: Disagreement detection and mapping
**Derivatives**: Meta-insights from patterns

### ✅ Outlier Detection

Automatically classifies outlier responses as:
- **Hallucination** → Exclude
- **Valuable Dissent** → Highlight
- **Outdated** → Note context
- **Misunderstood Query** → Re-run

### ✅ 21 Models Across 4 Providers

- Anthropic: 5 models
- OpenAI: 9 models
- Gemini: 5 models
- DeepSeek: 2 models

## Programmatic Usage

```typescript
import { ResearchEngine, providerRegistry, createConfig } from 'kno-it';

// Initialize
const config = createConfig({
  geminiKey: process.env.GEMINI_API_KEY,
  openaiKey: process.env.OPENAI_API_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  deepseekKey: process.env.DEEPSEEK_API_KEY
});

providerRegistry.initialize(config);

// Research
const engine = new ResearchEngine({
  depth: 'verified',
  primaryModel: 'gemini-2.5-flash'
});

const results = await engine.investigate("your research topic");

// Results include:
// - confirmed: Facts all models agree on
// - disputed: Contradictory claims
// - unique: Single-source findings
// - derivatives: Meta-insights
// - outliers: Flagged anomalies
// - costBreakdown: Exact API costs
```

## Architecture

```
kno-it/
├── src/
│   ├── core/
│   │   ├── types.ts              # Type definitions
│   │   ├── ModelRegistry.ts      # 21 models with pricing
│   │   └── ProviderRegistry.ts   # Provider management
│   ├── providers/
│   │   ├── LLMProvider.ts        # Base class
│   │   ├── AnthropicProvider.ts
│   │   ├── GeminiProvider.ts
│   │   ├── OpenAIProvider.ts
│   │   └── DeepSeekProvider.ts
│   ├── research/
│   │   ├── ResearchEngine.ts     # Main orchestrator
│   │   ├── ConsensusEngine.ts    # Statistical analysis
│   │   └── OutlierIsolator.ts    # Quality control
│   ├── index.ts                  # Public API
│   └── demo.ts                   # CLI demo
└── .agent/
    ├── RESEARCH_PRESETS.md
    ├── STATISTICAL_ANALYSIS.md
    ├── OUTLIER_DETECTION.md
    └── ADDITIONAL_MODELS.md
```

## Version

**v0.2.0** - ResearchEngine complete with full statistical analysis

## License

Proprietary - Y-OS Project
