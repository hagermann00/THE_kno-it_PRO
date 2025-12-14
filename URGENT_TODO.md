# 🚨 URGENT TO-DO LIST
## Kno-It Production Readiness - Priority Actions

**Last Updated:** December 14, 2025
**Timeline:** Organized by urgency (CRITICAL → LOW)

---

## 🔴 CRITICAL - DO IMMEDIATELY (Before Any Production Use)

**Security & Safety Issues - Fix ASAP**

### 1. Remove ALL Type Safety Bypasses ⚠️
**Priority:** CRITICAL
**Time:** 2-3 hours
**Files to fix:**
- [ ] `src/providers/MockProvider.ts:17` - Remove `as any` cast
- [ ] `src/providers/GroqProvider.ts:17` - Fix type definition
- [ ] `src/providers/HuggingFaceProvider.ts:12` - Fix type definition
- [ ] `src/demo.ts:48` - Properly type config object
- [ ] `src/research/ResearchEngine.ts:120` - Fix return type casting

**Action:** Fix the underlying type definitions instead of using `as any`

### 2. Add Input Validation with Zod ⚠️
**Priority:** CRITICAL
**Time:** 3-4 hours
**Files to fix:**
- [ ] `src/research/ResearchEngine.ts:24` - Validate `topic` parameter
- [ ] `src/core/StorageEngine.ts:71` - Sanitize search queries
- [ ] All provider constructors - Validate API keys

**Example fix:**
```typescript
import { z } from 'zod';

const TopicSchema = z.string()
    .min(1, "Topic required")
    .max(500, "Topic too long")
    .regex(/^[a-zA-Z0-9\s\-,\.]+$/, "Invalid characters");

async investigate(topic: string) {
    const validTopic = TopicSchema.parse(topic);
    // ...
}
```

### 3. Validate ALL External API Responses ⚠️
**Priority:** CRITICAL
**Time:** 4-5 hours
**Files to fix:**
- [ ] `src/providers/GeminiProvider.ts:97-112` - Validate response structure
- [ ] `src/providers/OpenAIProvider.ts:84-104` - Validate completion structure
- [ ] `src/providers/AnthropicProvider.ts:66-86` - Validate message structure
- [ ] `src/providers/DeepSeekProvider.ts:72-92` - Validate response

**Action:** Use Zod schemas to validate API responses before accessing properties

### 4. Implement Proper Error Handling ⚠️
**Priority:** CRITICAL
**Time:** 5-6 hours
**Files to fix:**
- [ ] Create `src/core/errors.ts` with custom error classes
- [ ] `src/research/ResearchEngine.ts:230` - Don't swallow errors
- [ ] `src/core/ProviderRegistry.ts:56-58` - Aggregate initialization errors
- [ ] `src/core/StorageEngine.ts:71-81` - Add try-catch blocks

**Create custom errors:**
```typescript
// src/core/errors.ts
export class ProviderError extends Error {
    constructor(
        public provider: string,
        public modelId: string,
        public originalError: Error
    ) {
        super(`${provider} failed for ${modelId}: ${originalError.message}`);
        this.name = 'ProviderError';
    }
}

export class ValidationError extends Error {
    constructor(field: string, reason: string) {
        super(`Validation failed for ${field}: ${reason}`);
        this.name = 'ValidationError';
    }
}
```

### 5. Never Log API Keys ⚠️
**Priority:** CRITICAL
**Time:** 1 hour
**Files to audit:**
- [ ] Search entire codebase for any console.log of config/apiKey
- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Review error messages to ensure keys aren't leaked

**Action:** Run: `grep -r "console.log.*apiKey\|console.log.*key" src/`

---

## 🟠 HIGH URGENCY - Do This Week

**Reliability & Production Readiness**

### 6. Replace console.log with Proper Logging
**Priority:** HIGH
**Time:** 3-4 hours
**Files to fix:** All 19 TypeScript files (40+ instances)

**Action:**
```bash
npm install winston
```

```typescript
// src/core/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});
```

**Find & replace:**
- [ ] `console.log` → `logger.info`
- [ ] `console.error` → `logger.error`
- [ ] `console.warn` → `logger.warn`

### 7. Add Request Timeouts to All Providers
**Priority:** HIGH
**Time:** 2-3 hours
**Files to fix:**
- [ ] `src/providers/OllamaProvider.ts:44` - Add AbortController timeout
- [ ] `src/providers/GeminiProvider.ts` - Add timeout config
- [ ] `src/providers/OpenAIProvider.ts` - Add timeout config
- [ ] All other providers

**Example fix:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30s

try {
    const response = await fetch(url, {
        signal: controller.signal,
        // ...
    });
} finally {
    clearTimeout(timeout);
}
```

### 8. Implement Rate Limiting
**Priority:** HIGH
**Time:** 3-4 hours
**Action:**
```bash
npm install bottleneck
```

```typescript
// src/core/RateLimiter.ts
import Bottleneck from 'bottleneck';

export const rateLimiters = {
    openai: new Bottleneck({ minTime: 100, maxConcurrent: 5 }),
    anthropic: new Bottleneck({ minTime: 100, maxConcurrent: 5 }),
    gemini: new Bottleneck({ minTime: 50, maxConcurrent: 10 }),
    // ...
};
```

**Files to update:**
- [ ] `src/providers/OpenAIProvider.ts` - Wrap API calls
- [ ] `src/providers/AnthropicProvider.ts` - Wrap API calls
- [ ] All other providers

### 9. Add Error Aggregation for Parallel Operations
**Priority:** HIGH
**Time:** 2-3 hours
**Files to fix:**
- [ ] `src/research/ResearchEngine.ts:211-234` - Aggregate errors from Promise.all

**Example fix:**
```typescript
const results = await Promise.allSettled(
    workflow.models.map(modelId => provider.generateText(params))
);

const successes = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

const failures = results
    .filter(r => r.status === 'rejected')
    .map(r => ({ model: '...', error: r.reason }));

if (failures.length > 0) {
    logger.warn('Some models failed', { failures });
}
```

### 10. Externalize All Configuration
**Priority:** HIGH
**Time:** 3-4 hours
**Action:**
```bash
# Create config file
touch src/config/defaults.ts
```

**Files to refactor:**
- [ ] `src/research/ResearchEngine.ts:134-168` - Move workflow configs
- [ ] `src/providers/OllamaProvider.ts:16` - Move default URL
- [ ] All hardcoded values

```typescript
// src/config/defaults.ts
export const CONFIG = {
    RATE_LIMITS: {
        openai: { minTime: 100, maxConcurrent: 5 },
        anthropic: { minTime: 100, maxConcurrent: 5 },
    },
    TIMEOUTS: {
        default: 30000,
        extended: 60000,
    },
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    // ...
};
```

---

## 🟡 MEDIUM URGENCY - Do This Month

**Code Quality & Maintainability**

### 11. Write Core Tests (80% Coverage Target)
**Priority:** MEDIUM
**Time:** 20-30 hours
**Files to create:**
- [ ] `tests/unit/core/ModelRegistry.test.ts`
- [ ] `tests/unit/core/ProviderRegistry.test.ts`
- [ ] `tests/unit/research/ConsensusEngine.test.ts`
- [ ] `tests/unit/research/OutlierIsolator.test.ts`
- [ ] `tests/integration/research-workflow.test.ts`

**Start here:**
```typescript
// tests/unit/core/ModelRegistry.test.ts
import { describe, it, expect } from 'vitest';
import { modelRegistry } from '../../../src/core/ModelRegistry';

describe('ModelRegistry', () => {
    it('should get model by ID', () => {
        const model = modelRegistry.get('gpt-4o-mini');
        expect(model?.displayName).toBe('GPT-4o Mini');
    });

    it('should calculate cost accurately', () => {
        const cost = modelRegistry.estimateCost('gpt-4o-mini', 1000, 500);
        expect(cost).toBeCloseTo(0.00045, 6);
    });
});
```

### 12. Refactor Duplicated Provider Code
**Priority:** MEDIUM
**Time:** 4-6 hours
**Files to refactor:**
- [ ] Extract `OpenAICompatibleProvider` base class
- [ ] Refactor `src/providers/OpenAIProvider.ts`
- [ ] Refactor `src/providers/DeepSeekProvider.ts`

**Create:**
```typescript
// src/providers/OpenAICompatibleProvider.ts
export abstract class OpenAICompatibleProvider extends LLMProvider {
    protected abstract client: OpenAI;

    async generateText(params: TextGenParams): Promise<TextGenResult> {
        // Common implementation for OpenAI-compatible APIs
    }
}
```

### 13. Add Database Indexes
**Priority:** MEDIUM
**Time:** 1 hour
**Files to fix:**
- [ ] `src/core/StorageEngine.ts:22-50` - Add indexes to schema

**Action:**
```typescript
this.db.exec(`
    CREATE INDEX IF NOT EXISTS idx_topic ON research_logs(topic);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON research_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_topic_timestamp
        ON research_logs(topic, timestamp DESC);
`);
```

### 14. Break Down Complex Functions
**Priority:** MEDIUM
**Time:** 4-5 hours
**Files to refactor:**
- [ ] `src/research/ConsensusEngine.ts:94-185` - Extract helper functions
- [ ] `src/research/ResearchEngine.ts:126-200` - Split workflow logic

**Example refactor:**
```typescript
// Before: 91-line deriveInsights function
deriveInsights() { /* 91 lines */ }

// After: Multiple focused functions
private checkConvergentConfidence() { /* ... */ }
private detectContextDependency() { /* ... */ }
private analyzeUniqueClaims() { /* ... */ }
private detectContradictions() { /* ... */ }
private analyzeNumericalVariance() { /* ... */ }
```

### 15. Add JSDoc to Public APIs
**Priority:** MEDIUM
**Time:** 6-8 hours
**Files to document:**
- [ ] `src/core/ModelRegistry.ts` - All public methods
- [ ] `src/core/ProviderRegistry.ts` - All public methods
- [ ] `src/research/ResearchEngine.ts` - Main API
- [ ] `src/index.ts` - Exported functions

### 16. Fix Weak Type Definitions
**Priority:** MEDIUM
**Time:** 2-3 hours
**Files to fix:**
- [ ] `src/research/ConsensusEngine.ts:349-354` - Replace `any[]` with proper types

```typescript
// Before
interface Variance {
    disagreements: any[];
    unique: any[];
    contradictions: any[];
}

// After
interface Disagreement {
    text: string;
    models: string[];
    count: number;
}

interface UniqueClaim {
    text: string;
    model: string;
    confidence: 'low';
}

interface Contradiction {
    model1: string;
    model2: string;
    text1: string;
    text2: string;
}

interface Variance {
    disagreements: Disagreement[];
    unique: UniqueClaim[];
    contradictions: Contradiction[];
}
```

---

## 🟢 LOW URGENCY - Nice to Have

**Polish & Optimization**

### 17. Replace Magic Numbers with Constants
**Priority:** LOW
**Time:** 1-2 hours
**Files to fix:**
- [ ] `src/providers/LLMProvider.ts:46` - Backoff multiplier
- [ ] `src/research/OutlierIsolator.ts:111` - Z-score threshold
- [ ] `src/research/OutlierIsolator.ts:146` - Similarity threshold
- [ ] `src/research/ConsensusEngine.ts:159` - Variance threshold

```typescript
// src/config/constants.ts
export const OUTLIER_DETECTION = {
    Z_SCORE_THRESHOLD: 2.5,
    SIMILARITY_THRESHOLD: 0.3,
    NUMERICAL_OUTLIER_FACTOR: 10,
};

export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    BASE_DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
};
```

### 18. Add readonly Modifiers
**Priority:** LOW
**Time:** 1 hour
**Files to fix:**
- [ ] `src/core/ModelRegistry.ts:482` - Make models map readonly
- [ ] `src/research/ResearchEngine.ts:13-14` - Make engine instances readonly
- [ ] All provider constructors

### 19. Implement Caching Layer
**Priority:** LOW
**Time:** 4-5 hours
**Action:**
```bash
npm install lru-cache
```

**Files to update:**
- [ ] `src/core/ModelRegistry.ts` - Cache model lookups
- [ ] `src/core/ProviderRegistry.ts` - Cache provider resolution

### 20. Use Proper Tokenizer
**Priority:** LOW
**Time:** 2-3 hours
**Action:**
```bash
npm install tiktoken
```

**Files to fix:**
- [ ] `src/providers/OllamaProvider.ts:58-59` - Replace crude estimation

---

## 📊 Progress Tracking

### Week 1 Sprint (Critical)
- [ ] Fix type safety bypasses (3h)
- [ ] Add Zod validation (4h)
- [ ] Validate API responses (5h)
- [ ] Implement error handling (6h)
- [ ] Audit API key logging (1h)
- [ ] Replace console.log (4h)
- [ ] Add request timeouts (3h)
- [ ] Implement rate limiting (4h)

**Total:** ~30 hours

### Week 2-3 Sprint (High)
- [ ] Error aggregation (3h)
- [ ] Externalize configuration (4h)
- [ ] Write core tests (30h)
- [ ] Refactor providers (6h)
- [ ] Add DB indexes (1h)

**Total:** ~44 hours

### Week 4 Sprint (Medium)
- [ ] Refactor complex functions (5h)
- [ ] Add JSDoc (8h)
- [ ] Fix type definitions (3h)

**Total:** ~16 hours

---

## 🎯 Success Metrics

**Before Production Deployment:**
- [ ] ✅ Zero `as any` casts in codebase
- [ ] ✅ All inputs validated with Zod
- [ ] ✅ All API responses validated
- [ ] ✅ Custom error classes implemented
- [ ] ✅ Zero console.log statements
- [ ] ✅ 75%+ test coverage
- [ ] ✅ All providers have timeouts
- [ ] ✅ Rate limiting implemented
- [ ] ✅ No hardcoded configuration values
- [ ] ✅ All public APIs documented

---

## 🚀 Quick Start Commands

```bash
# Install missing dependencies
npm install winston bottleneck zod lru-cache

# Run linter
npm run lint

# Run tests (after writing them)
npm test

# Check for API keys in code
grep -r "console.log.*key\|console.log.*apiKey" src/

# Build
npm run build

# Run demo with mock providers (safe for testing)
USE_MOCK=true npm run demo "test query"
```

---

## 📞 Help Needed?

**Stuck on any task?** Ask Claude for:
- Specific code examples for any fix
- Test case examples
- Refactoring guidance
- Best practices clarification

**Example:** "Show me how to implement Zod validation for ResearchEngine.investigate()"

---

**Last Updated:** December 14, 2025
**Next Review:** After Week 1 Sprint completion
