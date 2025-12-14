/**
 * Kno-It Input Validation Schemas
 * Zod schemas for all user inputs
 */

import { z } from 'zod';

/**
 * Research topic validation
 */
export const TopicSchema = z.string()
    .min(1, 'Topic is required')
    .max(2000, 'Topic must be under 2000 characters')
    .transform(s => s.trim());

/**
 * Research depth validation
 */
export const ResearchDepthSchema = z.enum([
    'flash', 'budget', 'quick', 'standard', 'verified', 'deep-dive'
]);

/**
 * Model ID validation
 */
export const ModelIdSchema = z.string()
    .min(1, 'Model ID required')
    .regex(/^[a-zA-Z0-9\-\.\/]+$/, 'Invalid model ID format');

/**
 * API Key validation (basic format check, not content)
 */
export const APIKeySchema = z.string()
    .min(10, 'API key too short')
    .max(500, 'API key too long');

/**
 * Research config validation
 */
export const ResearchConfigSchema = z.object({
    depth: ResearchDepthSchema,
    primaryModel: ModelIdSchema,
    validationModel: ModelIdSchema.optional(),
    secondaryModels: z.array(ModelIdSchema).optional(),
    enableMCP: z.boolean().optional(),
    maxCost: z.number().positive().optional()
});

/**
 * Provider config validation
 */
export const ProviderConfigSchema = z.object({
    providers: z.object({
        gemini: z.object({ apiKey: APIKeySchema }).optional(),
        openai: z.object({ apiKey: APIKeySchema }).optional(),
        anthropic: z.object({ apiKey: APIKeySchema }).optional(),
        deepseek: z.object({ apiKey: APIKeySchema }).optional(),
        groq: z.object({ apiKey: APIKeySchema }).optional(),
        huggingface: z.object({ apiKey: APIKeySchema }).optional()
    }),
    defaults: z.object({
        researchDepth: ResearchDepthSchema,
        primaryModel: ModelIdSchema,
        validationModel: ModelIdSchema.optional()
    })
});

/**
 * Text generation params validation
 */
export const TextGenParamsSchema = z.object({
    prompt: z.string().min(1, 'Prompt required').max(100000, 'Prompt too long'),
    systemPrompt: z.string().max(50000).optional(),
    model: ModelIdSchema.optional(),
    maxTokens: z.number().int().positive().max(200000).optional(),
    temperature: z.number().min(0).max(2).optional()
});

// Type exports for use with schemas
export type ValidatedTopic = z.infer<typeof TopicSchema>;
export type ValidatedResearchConfig = z.infer<typeof ResearchConfigSchema>;
export type ValidatedTextGenParams = z.infer<typeof TextGenParamsSchema>;
