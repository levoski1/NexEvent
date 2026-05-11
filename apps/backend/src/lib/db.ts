import mongoose from 'mongoose';
import { config } from '@nexevent/config';
import { logger } from './logger';

export async function connectDb(): Promise<void> {
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  await mongoose.connect(config.MONGODB_URI);
  logger.info('MongoDB connected');
}
