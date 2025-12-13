/**
 * OpenAI Provider
 * Handles interactions with OpenAI models (GPT-4o, GPT-5, o3, etc.)
 * 
 * Adapted from ChatGPT's implementation to match Kno-It architecture
 */

import OpenAI from 'openai';
import { LLMProvider } from './LLMProvider.js';
import { TextGenParams, TextGenResult, ModelCapability } from '../core/types.js';
import { modelRegistry } from '../core/ModelRegistry.js';

export class OpenAIProvider extends LLMProvider {
    readonly id = 'openai' as const;
    readonly name = 'OpenAI';

    private client: OpenAI;

    constructor(apiKey: string) {
        super();
        this.client = new OpenAI({ apiKey });
    }

    supports(capability: ModelCapability): boolean {
        const capabilities: ModelCapability[] = [
            'text-generation',
            'json-mode',
            'tool-calling',
            'vision',
            'extended-thinking',
            'image-generation'
        ];
        return capabilities.includes(capability);
    }

    async generateText(params: TextGenParams): Promise<TextGenResult> {
        return this.withRetry(async () => {
            const model = params.model || 'gpt-4o-mini';
            const modelDef = modelRegistry.get(model);

            // Build messages array
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

            // Add system message if provided
            if (params.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: params.systemPrompt
                });
            }

            // Add user prompt
            messages.push({
                role: 'user',
                content: params.prompt
            });

            // Build completion params
            const completionParams: OpenAI.Chat.ChatCompletionCreateParams = {
                model,
                messages,
                max_tokens: params.maxTokens,
                temperature: params.temperature,
            };

            // Add JSON mode if schema provided
            if (params.jsonSchema) {
                completionParams.response_format = { type: 'json_object' };
            }

            // Add tools if provided
            if (params.tools && params.tools.length > 0) {
                completionParams.tools = params.tools.map(tool => ({
                    type: 'function' as const,
                    function: {
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters
                    }
                }));
            }

            // Generate completion
            const completion = await this.client.chat.completions.create(completionParams);

            const choice = completion.choices[0];
            const message = choice.message;

            // Extract text content
            let text = '';
            if (typeof message.content === 'string') {
                text = message.content;
            } else if (Array.isArray(message.content)) {
                // Handle structured content (for vision models)
                text = message.content
                    .map(part => {
                        if ('type' in part && part.type === 'text' && 'text' in part) {
                            return part.text;
                        }
                        return '';
                    })
                    .join('\n')
                    .trim();
            }

            // Extract tool calls
            const toolCalls = message.tool_calls?.map(tc => ({
                name: tc.function.name,
                arguments: this.safeParseJson(tc.function.arguments)
            }));

            // Get usage
            const inputTokens = completion.usage?.prompt_tokens || 0;
            const outputTokens = completion.usage?.completion_tokens || 0;

            // Calculate cost
            const costEstimate = modelDef
                ? modelRegistry.estimateCost(model, inputTokens, outputTokens)
                : 0;

            return {
                text,
                usage: {
                    inputTokens,
                    outputTokens,
                },
                toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
                model,
                provider: this.id,
                costEstimate
            };
        });
    }

    /**
     * Safely parse JSON, return original string if parsing fails
     */
    private safeParseJson(input: string): Record<string, unknown> {
        try {
            return JSON.parse(input);
        } catch {
            return { raw: input };
        }
    }
}
