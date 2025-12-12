/**
 * Google Gemini Provider
 * Handles interactions with Gemini models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider } from './LLMProvider';
import { TextGenParams, TextGenResult, ModelCapability } from '../core/types';
import { modelRegistry } from '../core/ModelRegistry';

export class GeminiProvider extends LLMProvider {
    readonly id = 'gemini' as const;
    readonly name = 'Google Gemini';

    private client: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super();
        this.client = new GoogleGenerativeAI(apiKey);
    }

    supports(capability: ModelCapability): boolean {
        const capabilities: ModelCapability[] = [
            'text-generation',
            'json-mode',
            'tool-calling',
            'vision',
            'web-search',
            'extended-thinking'
        ];
        return capabilities.includes(capability);
    }

    async generateText(params: TextGenParams): Promise<TextGenResult> {
        return this.withRetry(async () => {
            const modelId = params.model || 'gemini-2.5-flash';
            const modelDef = modelRegistry.get(modelId);

            // Get the model
            const model = this.client.getGenerativeModel({ model: modelId });

            // Build generation config
            const generationConfig: any = {
                maxOutputTokens: params.maxTokens,
                temperature: params.temperature,
            };

            // Add JSON mode if schema provided
            if (params.jsonSchema) {
                generationConfig.responseMimeType = 'application/json';
                generationConfig.responseSchema = params.jsonSchema;
            }

            // Add thinking configuration if requested
            if (params.thinkingBudget) {
                generationConfig.thinkingConfig = {
                    thinkingBudget: params.thinkingBudget
                };
            }

            // Build the parts array for the prompt
            const parts: any[] = [{ text: params.prompt }];

            // Create the request
            const request: any = {
                contents: [{ role: 'user', parts }],
                generationConfig,
            };

            // Add system instruction if provided
            if (params.systemPrompt) {
                request.systemInstruction = params.systemPrompt;
            }

            // Add tools if provided
            if (params.tools && params.tools.length > 0) {
                request.tools = [{
                    functionDeclarations: params.tools.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters
                    }))
                }];
            }

            // Generate content
            const result = await model.generateContent(request);
            const response = result.response;

            // Extract text
            const text = response.text();

            // Extract tool calls (if any)
            const toolCalls = response.functionCalls()?.map(call => ({
                name: call.name,
                arguments: call.args as Record<string, unknown>
            }));

            // Get usage metadata
            const usageMetadata = response.usageMetadata;
            const inputTokens = usageMetadata?.promptTokenCount || 0;
            const outputTokens = usageMetadata?.candidatesTokenCount || 0;

            // Calculate cost
            const costEstimate = modelDef
                ? modelRegistry.estimateCost(modelId, inputTokens, outputTokens)
                : 0;

            return {
                text,
                usage: {
                    inputTokens,
                    outputTokens,
                },
                toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
                model: modelId,
                provider: this.id,
                costEstimate
            };
        });
    }
}
