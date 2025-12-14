
import 'dotenv/config';
import * as readline from 'readline';
import { providerRegistry } from './core/ProviderRegistry.js';
import { createConfig } from './index.js';
import { getPersona, SQUAD_TYPES } from './core/PersonaRegistry.js';
import { TextGenParams } from './core/types.js';

// Initialize environment
const config = createConfig({
    geminiKey: process.env.GEMINI_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    deepseekKey: process.env.DEEPSEEK_API_KEY,
    groqKey: process.env.GROQ_API_KEY
});

providerRegistry.initialize(config);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log('\n🏗️  KNO-IT ARCHITECT (v0.2.1)');
    console.log('=============================');
    console.log('Describe your research goal in natural language.');
    console.log('I will help you design the perfect workflow strategy.\n');

    // 1. Select the Interviewer Model (Low Cost Priority)
    let interviewerModel = 'gemini-2.5-flash'; // Default cheap, smart, fast
    let providerId = 'gemini';

    if (!providerRegistry.has('gemini')) {
        if (providerRegistry.has('groq')) {
            interviewerModel = 'llama3-70b-8192';
            providerId = 'groq';
        } else if (providerRegistry.has('openai')) {
            interviewerModel = 'gpt-4o-mini';
            providerId = 'openai';
        } else {
            console.error('❌ No suitable "Architect" model found (Gemini/Groq/OpenAI). Check .env');
            process.exit(1);
        }
    }

    // 2. Build the System Primer
    const availableModels = providerRegistry.getAll().map(p => p.id).join(', ');
    const squadNames = SQUAD_TYPES.join(', ');

    const systemPrimer = `
You are the Kno-It Architect (v0.2.1). Your mission is to interview the user and design a custom "Research Workflow" JSON configuration for them.

**Our Capabilities (Super Powers):**
- **Dynamic Squads:** We can simulate different expert teams: [${squadNames}].
- **Auto-Healing:** If an agent fails (broken/broke), we auto-swap them instantly.
- **Trust Scoring:** We calculate a mathematically objective confidence score (0-100%) for every claim.
- **Savage Truth:** We do not filter for politeness; we filter for accuracy and leverage.
- **Models Available:** [${availableModels}]. We can mix and match these.

**Workflow Options:**
- **Depth:** 'flash' (Fast), 'standard' (Balanced), 'deep-dive' (Comprehensive), 'verified' (Consensus-heavy).
- **Persona:** 'analyst' (Default), or any custom role.

**Your Goal:**
1. Understand what the user wants to know or solve.
2. Suggest the best "Squad" and "Depth" for the job.
3. Determine the best specific models to use (e.g., "Use DeepSeek for coding, Gemini for speed").
4. When the design is agreed upon, output a FINAL JSON block in this format:
\`\`\`json
{
  "topic": "The user's refined query",
  "depth": "standard",
  "persona": "The chosen squad/persona ID",
  "notes": "Any specific instructions for the engine"
}
\`\`\`
`.trim();

    const interviewer = providerRegistry.get(providerId as any);
    if (!interviewer) throw new Error('Interviewer init failed');

    const history: { role: 'user' | 'assistant' | 'system', content: string }[] = [
        { role: 'system', content: systemPrimer }
    ];

    console.log(`🤖 Architect online (${interviewerModel})...\n`);

    const ask = () => {
        rl.question('You: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                rl.close();
                process.exit(0);
            }

            history.push({ role: 'user', content: userInput });

            const conversationPrompt = history
                .filter(m => m.role !== 'system')
                .map(m => `${m.role === 'user' ? 'User' : 'Architect'}: ${m.content}`)
                .join('\n\n');

            try {
                process.stdout.write('Architect: ... \r');
                const response = await interviewer.generateText({
                    model: interviewerModel,
                    prompt: conversationPrompt,
                    systemPrompt: systemPrimer,
                    maxTokens: 1000,
                    temperature: 0.7
                });

                process.stdout.write('                         \r'); // Clear loading
                console.log(`Architect: ${response.text}\n`);

                history.push({ role: 'assistant', content: response.text });

                // Check if JSON was generated
                if (response.text.includes('```json')) {
                    console.log('✅ Design Complete! You can now run this research config.');
                }

                ask();
            } catch (error) {
                console.error('❌ Architect Error:', error);
                ask();
            }
        });
    };

    ask();
}

main().catch(console.error);
