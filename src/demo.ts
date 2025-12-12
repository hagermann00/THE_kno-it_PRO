/**
 * Kno-It CLI Demo
 * Test the research engine from command line
 */

import { providerRegistry } from './core/ProviderRegistry';
import { ResearchEngine } from './research/ResearchEngine';
import { createConfig } from './index';

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      KNO-IT CLI DEMO                          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Usage: npm run demo "your research question"                 ║
║                                                               ║
║  Examples:                                                     ║
║    npm run demo "dropshipping profit margins 2024"            ║
║    npm run demo "best programming languages 2024"             ║
║    npm run demo "AI model comparison GPT vs Claude"           ║
║                                                               ║
║  Note: Set API keys in .env first                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
        process.exit(0);
    }

    const topic = args.join(' ');

    console.log('\n🔬 Kno-It Research Engine\n');
    console.log(`Topic: "${topic}"\n`);

    // Initialize providers
    const config = createConfig({
        geminiKey: process.env.GEMINI_API_KEY,
        openaiKey: process.env.OPENAI_API_KEY,
        anthropicKey: process.env.ANTHROPIC_API_KEY,
        deepseekKey: process.env.DEEPSEEK_API_KEY
    });

    providerRegistry.initialize(config as any);

    const availableProviders = providerRegistry.listAvailable();

    if (availableProviders.length === 0) {
        console.error('❌ No providers initialized. Check your API keys in .env');
        process.exit(1);
    }

    console.log(`✅ Initialized providers: ${availableProviders.join(', ')}\n`);

    // Create research engine
    const engine = new ResearchEngine({
        depth: 'standard',  // Use standard preset
        primaryModel: 'gemini-2.5-flash'
    });

    // Run research
    console.log('🔍 Researching...\n');

    try {
        const result = await engine.investigate(topic);

        // Display results
        console.log('═'.repeat(70));
        console.log('📊 RESEARCH RESULTS');
        console.log('═'.repeat(70));
        console.log();

        console.log('📝 SUMMARY');
        console.log(result.summary);
        console.log();

        console.log('✅ CONFIRMED FACTS');
        result.confirmed.slice(0, 5).forEach((fact, idx) => {
            console.log(`${idx + 1}. ${fact.claim}`);
            console.log(`   Confidence: ${fact.confidence.toUpperCase()}`);
            console.log(`   Agreed by: ${fact.agreedBy.join(', ')}`);
            console.log();
        });

        if (result.disputed.length > 0) {
            console.log('⚠️  DISPUTED FACTS');
            result.disputed.forEach((fact, idx) => {
                console.log(`${idx + 1}. ${fact.claim}`);
                console.log();
            });
        }

        if (result.unique.length > 0) {
            console.log('💡 UNIQUE CLAIMS (single source)');
            result.unique.slice(0, 3).forEach((fact, idx) => {
                console.log(`${idx + 1}. ${fact.claim} (from ${fact.source})`);
            });
            console.log();
        }

        if ((result as any).derivatives?.length > 0) {
            console.log('🔬 META-INSIGHTS');
            (result as any).derivatives.forEach((d: any, idx: number) => {
                console.log(`${idx + 1}. ${d.title}`);
                console.log(`   ${d.message}`);
                if (d.recommendation) {
                    console.log(`   → ${d.recommendation}`);
                }
                console.log();
            });
        }

        console.log('═'.repeat(70));
        console.log('📈 METADATA');
        console.log('═'.repeat(70));
        console.log(`Models used: ${result.metadata.modelsUsed.join(', ')}`);
        console.log(`Total queries: ${result.metadata.totalQueries}`);
        console.log(`Duration: ${(result.metadata.duration / 1000).toFixed(2)}s`);
        console.log(`Total cost: $${result.costBreakdown.total.toFixed(4)}`);
        console.log();

    } catch (error) {
        console.error('❌ Research failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);
