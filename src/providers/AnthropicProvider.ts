/**
 * Anthropic Claude Provider
 * Handles interactions with Claude models
 */

import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from './LLMProvider.js';
import { TextGenParams, TextGenResult, ModelCapability, ProviderID } from '../core/types.js';
import { modelRegistry } from '../core/ModelRegistry.js';

export class AnthropicProvider extends LLMProvider {
    readonly id: ProviderID = 'anthropic';
    readonly name = 'Anthropic Claude';

    private client: Anthropic;

    constructor(apiKey: string) {
        super();
        this.client = new Anthropic({ apiKey: apiKey || '' });
    }

    supports(capability: ModelCapability): boolean {
        const capabilities: ModelCapability[] = [
            'text-generation',
            'json-mode',
            'tool-calling',
            'vision',
            'extended-thinking'
        ];
        return capabilities.includes(capability);
    }

    async generateText(params: TextGenParams): Promise<TextGenResult> {
        return this.withRetry(async () => {
            const model = params.model || 'claude-3.5-haiku';
            const modelDef = modelRegistry.get(model);

            // Build messages (Claude requires at least one user message)
            const messages: Anthropic.MessageParam[] = [
                { role: 'user', content: params.prompt }
            ];

            // Build the request - use MessageCreateParamsNonStreaming explicitly
            const requestParams: Anthropic.MessageCreateParamsNonStreaming = {
                model,
                messages,
                max_tokens: params.maxTokens || 8192,
            };

            // Add temperature if provided
            if (params.temperature !== undefined) {
                requestParams.temperature = params.temperature;
            }

            // Add system prompt if provided
            if (params.systemPrompt) {
                requestParams.system = params.systemPrompt;
            }

            // Add tools if provided
            if (params.tools && params.tools.length > 0) {
                requestParams.tools = params.tools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.parameters as Anthropic.Tool.InputSchema
                }));
            }

            const response: Anthropic.Message = await this.client.messages.create(requestParams);

            // Extract text content
            const textContent = response.content
                .filter((block: Anthropic.ContentBlock): block is Anthropic.TextBlock => block.type === 'text')
                .map((block: Anthropic.TextBlock) => block.text)
                .join('\n');

            // Extract tool calls
            const toolCalls = response.content
                .filter((block: Anthropic.ContentBlock): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
                .map((block: Anthropic.ToolUseBlock) => ({
                    name: block.name,
                    arguments: block.input as Record<string, unknown>
                }));

            // Calculate cost
            const inputTokens = response.usage.input_tokens;
            const outputTokens = response.usage.output_tokens;
            const costEstimate = modelDef
                ? modelRegistry.estimateCost(model, inputTokens, outputTokens)
                : 0;

            return {
                text: textContent,
                usage: {
                    inputTokens,
                    outputTokens,
                },
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                model,
                provider: this.id,
                costEstimate
            };
        });
    }
}
