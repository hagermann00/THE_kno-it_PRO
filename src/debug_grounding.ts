
import 'dotenv/config';
import { createBraveSearchProvider } from './providers/BraveSearchProvider.js';
import { groundingSwitchboard } from './core/GroundingSwitchboard.js';

async function testGrounding() {
    console.log('--- Grounding Debug Test ---');
    console.log('BRAVE_SEARCH_API_KEY:', process.env.BRAVE_SEARCH_API_KEY ? 'FOUND (Starts with ' + process.env.BRAVE_SEARCH_API_KEY.substring(0, 5) + ')' : 'MISSING');

    const brave = createBraveSearchProvider();
    if (brave) {
        console.log('Brave Provider Created: YES');
        console.log('Is Configured:', brave.isConfigured());
    } else {
        console.log('Brave Provider Created: NO');
    }

    const topic = "Bitcoin price today";
    console.log(`\nAnalyzing topic: "${topic}"`);
    const decision = groundingSwitchboard.analyze(topic);
    console.log('Decision:', JSON.stringify(decision, null, 2));

    if (decision.shouldGround && brave) {
        console.log('\nFetching context...');
        try {
            const context = await brave.getGroundingContext(topic);
            console.log('Context Length:', context.length);
            console.log('Preview:', context.substring(0, 200));
        } catch (e) {
            console.error('Fetch Error:', e);
        }
    }
}

testGrounding();
