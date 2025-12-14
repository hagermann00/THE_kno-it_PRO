/**
 * Kno-It API Server
 * Exposes the Research Engine via REST API for the Command Center
 */

import express from 'express';
import cors from 'cors';
import { ResearchEngine } from './research/ResearchEngine.js';
import { ResearchConfig, ResearchDepth } from './core/types.js';
import { logger } from './core/logger.js';
import { TopicSchema, ResearchConfigSchema } from './core/validation.js';

// Configuration
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'active', version: '0.2.0' });
});

app.post('/api/research', async (req, res) => {
    const startTime = Date.now();

    try {
        // 1. Validate Input
        const { topic, config } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Validate topic format
        const validatedTopic = TopicSchema.parse(topic);

        // Merge defaults with provided config
        const researchConfig: ResearchConfig = {
            depth: (config?.depth as ResearchDepth) || 'standard',
            primaryModel: config?.primaryModel || 'gemini-2.5-flash',
            ...config
        };

        // 2. Initialize Engine per request (stateless for now)
        // In the future, we might keep persistent engines for conversational context
        const engine = new ResearchEngine(researchConfig);

        logger.info('API: Starting research', { topic: validatedTopic, config: researchConfig });

        // 3. Execute Research
        // Note: This waits for completion. For long searches, we'll implement WebSockets later.
        const result = await engine.investigate(validatedTopic);

        // 4. Return Results
        res.json({
            success: true,
            data: result,
            meta: {
                duration: Date.now() - startTime,
                requestId: Math.random().toString(36).substring(7)
            }
        });

    } catch (error: any) {
        logger.error('API Error', { error: error.message, stack: error.stack });

        res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
});

// Start Server
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
        logger.info(`Command Center API listening on http://localhost:${PORT}`);
        console.log(`\n🚀 Kno-It API active at: http://localhost:${PORT}`);
        console.log(`   - Health check: http://localhost:${PORT}/health`);
        console.log(`   - Research endpoint: POST http://localhost:${PORT}/api/research\n`);
    });
}

export { app };
