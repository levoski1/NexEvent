import { config } from '@nexevent/config';
import { connectDb } from './lib/db';
import { logger } from './lib/logger';
import app from './app';

async function main() {
  await connectDb();

  const server = app.listen(config.BACKEND_PORT, () => {
    logger.info(`NexEvent backend listening on :${config.BACKEND_PORT}`);
    logger.info(`Swagger UI: http://localhost:${config.BACKEND_PORT}/api/docs`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
