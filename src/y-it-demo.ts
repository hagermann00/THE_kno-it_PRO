
/**
 * Y-It Master Protocol - Demo Runner
 */

import 'dotenv/config';
import { providerRegistry } from './core/ProviderRegistry.js';
import { ResearchEngine } from './research/ResearchEngine.js';
import { createConfig } from './index.js';

async function main() {
    const args = process.argv.slice(2);
    const topic = args.length > 0 ? args.join(' ') : "Dropshipping Trends Q1 2026";

    console.log('\n🔎 Y-IT FORENSIC INVESTIGATION');
    console.log('═'.repeat(60));
    console.log(`Topic: "${topic}"`);
    console.log(`Mode:  Reviewing Cast, Matrix, Treasury & Execution Data`);
    console.log('═'.repeat(60));

    // Initialize providers
    const config = createConfig({
        geminiKey: process.env.GEMINI_API_KEY,
        openaiKey: process.env.OPENAI_API_KEY,
        anthropicKey: process.env.ANTHROPIC_API_KEY,
        deepseekKey: process.env.DEEPSEEK_API_KEY,
        groqKey: process.env.GROQ_API_KEY
    });
    providerRegistry.initialize(config);

    // Create research engine with Y-IT PRESET
    const engine = new ResearchEngine({
        depth: 'y-it',               // <--- The new preset
        persona: 'investigator',     // <--- The new persona
        primaryModel: 'gemini-2.5-flash'
    });

    console.log('🕵️  Investigator is working... (This may take 30-60s)\n');

    try {
        const result = await engine.investigate(topic);

        console.log('═'.repeat(70));
        console.log('📁 INVESTIGATION REPORT');
        console.log('═'.repeat(70));
        console.log();

        // Check if we got a synthesized summary (Result of Pass 2)
        // Usually the last result in the array if multi-pass, but here "result.summary" is the consensus summary.
        // For Y-It, we want to see the full output from the models, especially the "Matrix" and "Treasury".

        console.log('📝 EXECUTIVE SUMMARY');
        console.log(result.summary);
        console.log();

        // Output raw synthesis if available (likely from the final pass model)
        // We'll peek into the underlying data if needed, but summary first.

        console.log('🔍 KEY FINDINGS (Confirmed)');
        result.confirmed.forEach((fact, idx) => {
            console.log(`${idx + 1}. ${fact.claim} [${fact.confidence}]`);
        });

        console.log('\n═'.repeat(70));
        console.log('📈 METRICS');
        console.log(`Models: ${result.metadata.modelsUsed.join(', ')}`);
        console.log(`Cost: $${result.costBreakdown.total.toFixed(4)}`);
        console.log('═'.repeat(70));

    } catch (error) {
        console.error('❌ Investigation failed:', error);
    }
}

main().catch(console.error);
