# KNO-IT MASTER CONTEXT
## Complete System Documentation
**Last Updated:** 2025-12-17T08:11:00-06:00  
**Version:** 0.1.0  
**Status:** ✅ OPERATIONAL - Build Passing, Y-It Protocol Wired

---

## 🎯 PROJECT OVERVIEW

**Kno-It** is a multi-LLM research orchestration engine designed to query multiple AI models, synthesize consensus answers, detect outliers, and provide confidence-scored results with full cost tracking.

### Core Philosophy
- **Multi-Model Consensus**: Query 2-5 LLMs simultaneously for the same question
- **Outlier Detection**: Flag responses that deviate significantly from consensus
- **Cost Optimization**: Track and minimize API costs across providers
- **Provider Agnostic**: Swap between Gemini, OpenAI, Anthropic, DeepSeek, Groq seamlessly
- **Y-It Protocol**: Specialized research mode for investigative deep-dives

---

## 📁 PROJECT STRUCTURE

```
C:\Y-OS\Y-IT_ENGINES\kno-it\
├── src/
│   ├── core/
│   │   ├── types.ts              # All TypeScript interfaces & types
│   │   ├── ModelRegistry.ts      # Model definitions & cost tables
│   │   ├── PersonaRegistry.ts    # System prompts for different personas
│   │   ├── prompts.ts            # Y_IT_MASTER_PROTOCOL prompt template
│   │   └── config.ts             # Configuration management
│   ├── providers/
│   │   ├── LLMProvider.ts        # Abstract base provider class
│   │   ├── GeminiProvider.ts     # Google Gemini integration
│   │   ├── OpenAIProvider.ts     # OpenAI GPT integration
│   │   ├── AnthropicProvider.ts  # Claude integration (FIXED)
│   │   ├── DeepSeekProvider.ts   # DeepSeek integration (FIXED)
│   │   ├── GroqProvider.ts       # Groq free tier integration
│   │   └── MockProvider.ts       # Zero-cost simulation mode (FIXED)
│   ├── research/
│   │   ├── ResearchEngine.ts     # Main orchestration engine
│   │   ├── ConsensusBuilder.ts   # Multi-response synthesis
│   │   └── OutlierDetector.ts    # Statistical outlier flagging
│   ├── storage/
│   │   ├── StorageEngine.ts      # Semantic caching & persistence
│   │   └── GoogleDriveBackup.ts  # Cloud backup integration
│   ├── grounding/
│   │   └── GroundingSwitchboard.ts # Live web search integration
│   ├── demo.ts                   # Standard demo script
│   ├── y-it-demo.ts              # Y-It Protocol demo script
│   └── index.ts                  # Main exports
├── dist/                         # Compiled JavaScript output
├── .env                          # API keys (gitignored)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
└── KNO_IT_MASTER_CONTEXT.md      # THIS FILE
```

---

## 🔧 KEY TYPES & INTERFACES

### ResearchDepth
```typescript
export type ResearchDepth = 'flash' | 'budget' | 'quick' | 'standard' | 'verified' | 'deep-dive' | 'y-it';
```

| Depth | Models Used | Use Case |
|-------|-------------|----------|
| `flash` | 1 model (fastest/cheapest) | Quick lookups |
| `budget` | 1-2 free-tier models | Cost-conscious queries |
| `quick` | 2 models | Fast consensus |
| `standard` | 3 models | Balanced accuracy/cost |
| `verified` | 4 models | High-confidence answers |
| `deep-dive` | 5+ models | Maximum consensus |
| `y-it` | gemini-2.5-flash | **INVESTIGATIVE PROTOCOL** |

### ProviderID
```typescript
export type ProviderID = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'ollama' | 'groq' | 'huggingface';
```

### ModelCapability
```typescript
export type ModelCapability = 'text-generation' | 'json-mode' | 'tool-calling' | 'vision' | 'extended-thinking';
```

---

## 🕵️ Y-IT MASTER PROTOCOL

The Y-It Protocol is a specialized research mode for investigative deep-dives. It uses a structured prompt template to evaluate topics through a forensic lens.

### Activation
```typescript
const engine = new ResearchEngine({
    depth: 'y-it',
    persona: 'investigator',
    // other config...
});
```

### Prompt Template Location
`src/core/prompts.ts` exports `Y_IT_MASTER_PROTOCOL`

### Template Structure
The Y-It Master Protocol evaluates topics across:
1. **Profitability Index** - Expected returns vs. effort
2. **Setup Effort** - Low/Medium/High barrier to entry
3. **Risk Assessment** - Financial, legal, reputational risks
4. **Reality Check** - Separates hype from sustainable models
5. **Actionable Verdict** - Clear recommendation with reasoning

---

## 👤 PERSONAS

Located in `src/core/PersonaRegistry.ts`:

| Persona ID | Name | Description |
|------------|------|-------------|
| `analyst` | Standard Analyst | Balanced, factual responses |
| `cfo` | CFO Advisor | Financial focus, cost-conscious |
| `cto` | CTO Advisor | Technical depth, implementation details |
| `savage` | Brutal Critic | No-holds-barred, cuts through BS |
| `investigator` | Lead Investigator | Forensic journalist, myth-buster |

---

## 🚀 AVAILABLE SCRIPTS

```bash
npm run build        # Compile TypeScript to dist/
npm run demo         # Run standard research demo
npm run dev          # Watch mode for development
```

### Manual Y-It Demo
```bash
npx tsx src/y-it-demo.ts
```

---

## 🔑 ENVIRONMENT VARIABLES

Required in `.env`:
```
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
BRAVE_SEARCH_API_KEY=your_key_here  # For grounding
```

**Free Tier Priority:**
1. Gemini 2.5 Flash (most generous free tier)
2. Groq (Llama 3 free tier)
3. DeepSeek (budget pricing)

---

## 🛠️ RECENT FIXES (2025-12-17)

### Build Errors Resolved
1. **AnthropicProvider.ts**
   - Fixed: `thinking` property type error (removed - SDK doesn't support it in NonStreaming)
   - Fixed: Explicit `Anthropic.Message` return type
   - Fixed: Block type annotations for filter callbacks

2. **DeepSeekProvider.ts**
   - Fixed: `ProviderID` type annotation for `id` property
   - Fixed: `FunctionParameters` cast for tool parameters

3. **MockProvider.ts**
   - Fixed: `ProviderID` type for constructor and `id` property

### Y-It Protocol Verification
- ✅ `ResearchDepth` includes `'y-it'`
- ✅ `PersonaRegistry` includes `investigator`
- ✅ `ResearchEngine.getWorkflow()` handles `case 'y-it':`
- ✅ `Y_IT_MASTER_PROTOCOL` imported and used for y-it depth

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                      USER REQUEST                            │
│                 "Research: Dropshipping"                     │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESEARCH ENGINE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Persona     │  │ Depth       │  │ Grounding   │          │
│  │ Registry    │  │ Config      │  │ Switchboard │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROVIDER LAYER                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ Gemini │ │ OpenAI │ │ Claude │ │DeepSeek│ │  Groq  │     │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONSENSUS BUILDER                           │
│           Compare responses → Detect outliers →              │
│           Calculate confidence → Synthesize answer           │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE ENGINE                            │
│         Semantic Cache │ Local Storage │ Drive Backup        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 REPOSITORY

**GitHub:** https://github.com/hagermann00/THE_kno-it_PRO

---

## 📝 NEXT STEPS / ROADMAP

1. [ ] Add CLI architect mode for custom workflow design
2. [ ] Implement streaming responses for long research
3. [ ] Add MCP (Model Context Protocol) server integration
4. [ ] Build web UI for interactive research sessions
5. [ ] Add Google Drive auto-backup scheduling

---

*This context file is the single source of truth for the Kno-It system. Update this file when making significant changes.*
