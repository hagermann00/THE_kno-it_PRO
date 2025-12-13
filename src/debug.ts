
import { providerRegistry } from './core/ProviderRegistry.js';
import { modelRegistry } from './core/ModelRegistry.js';
import { createConfig } from './index.js';

async function main() {
    try {
        console.log('1. Setting up Environment');
        process.env.USE_MOCK = 'true';

        console.log('2. Initializing Registry');
        providerRegistry.initialize({ providers: {}, defaults: {} } as any);

        console.log('3. Providers:', providerRegistry.listAvailable());

        console.log('4. Getting Provider for gemini-2.5-flash');
        const provider = providerRegistry.getProviderForModel('gemini-2.5-flash');

        if (!provider) {
            throw new Error('Provider not found');
        }

        console.log('5. Provider found:', provider.id);

        console.log('6. Generating Text using Mock');
        const result = await provider.generateText({
            prompt: 'test dropshipping',
            model: 'gemini-2.5-flash'
        });

        console.log('7. Result:', result);

    } catch (error) {
        console.error('CRASH:', error);
    }
}

main();
