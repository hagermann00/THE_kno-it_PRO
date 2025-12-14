# ChatGPT Task: Complete OpenAI & DeepSeek Providers

## Context

This is the **Kno-It** project — a multi-LLM research engine. We need you (ChatGPT) to complete the OpenAI and DeepSeek provider implementations since you know the OpenAI SDK best.

## Repository

GitHub: `https://github.com/hagermann00/THE_kno-it_PRO`

## What's Already Done

✅ Abstract `LLMProvider` base class (`src/providers/LLMProvider.ts`)
✅ `AnthropicProvider` (complete)
✅ `GeminiProvider` (complete)
✅ Type definitions (`src/core/types.ts`)
✅ Model registry with pricing (`src/core/ModelRegistry.ts`)

## What You Need to Write

### 1. `src/providers/OpenAIProvider.ts`

**Requirements:**
- Extend `LLMProvider` base class
- Use `openai` npm package (v4+)
- Implement `generateText(params: TextGenParams): Promise<TextGenResult>`
- Support:
  - Basic text generation
  - JSON mode (when `params.jsonSchema` is provided)
  - Tool calling (when `params.tools` is provided)
  - Temperature and max tokens control
  - Extended thinking for o3/o4 models (if supported)
- Use `this.withRetry()` wrapper for API calls (already in base class)
- Calculate cost using `modelRegistry.estimateCost(modelId, inputTokens, outputTokens)`
- Return `TextGenResult` with all required fields

**Models to support:**
- `gpt-4o`, `gpt-4o-mini`
- `gpt-5`, `gpt-5-mini`, `gpt-5-nano`
- `o3`, `o3-mini`, `o4-mini`

**Reference:**
- See `AnthropicProvider.ts` for implementation pattern
- OpenAI API docs: https://platform.openai.com/docs/api-reference/chat/create

### 2. `src/providers/DeepSeekProvider.ts`

**Requirements:**
- **Almost identical to OpenAIProvider** (DeepSeek uses OpenAI-compatible API)
- Only difference: Initialize client with `baseURL: 'https://api.deepseek.com'`
- Support models:
  - `deepseek-chat` (V3)
  - `deepseek-reasoner` (R1)

**Example initialization:**
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.deepseek.com'
});
```

**Reference:**
- DeepSeek API docs: https://api-docs.deepseek.com/

## Key Types to Use

From `src/core/types.ts`:

```typescript
export interface TextGenParams {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  jsonSchema?: object;
  thinkingBudget?: number;
  tools?: ToolDefinition[];
  maxTokens?: number;
  temperature?: number;
}

export interface TextGenResult {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    thinkingTokens?: number;
  };
  toolCalls?: ToolCall[];
  model: string;
  provider: ProviderID;
  costEstimate: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: object;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}
```

## Available Imports

```typescript
import OpenAI from 'openai';
import { LLMProvider } from './LLMProvider';
import { TextGenParams, TextGenResult, ModelCapability } from '../core/types';
import { modelRegistry } from '../core/ModelRegistry';
```

## Expected Output

Please provide the **complete, working code** for both files:
1. `src/providers/OpenAIProvider.ts`
2. `src/providers/DeepSeekProvider.ts`

Make sure they:
- ✅ Follow the same pattern as `AnthropicProvider.ts`
- ✅ Use proper TypeScript types
- ✅ Handle errors gracefully
- ✅ Calculate costs accurately
- ✅ Support all required features

## Questions?

If anything is unclear, check the existing `AnthropicProvider.ts` implementation in the repo for reference.

---

**Ready to code?** Drop the complete implementations below. 👇
