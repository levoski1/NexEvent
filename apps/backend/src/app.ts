import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import triggerRoutes from './routes/triggers';
import auditRoutes from './routes/audit';
import queueRoutes from './routes/queue';
import healthRoutes from './routes/health';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false }));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Swagger ──────────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'NexEvent API', version: '1.0.0', description: 'Soroban-to-Web2 automation' },
    servers: [{ url: '/api/v1' }],
  },
  apis: ['./src/routes/*.ts'],
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/triggers', triggerRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/queue', queueRoutes);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
