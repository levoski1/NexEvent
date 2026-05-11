#!/usr/bin/env ts-node
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/nexevent';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Dynamic import to avoid circular deps
  const { TriggerModel } = await import('../apps/backend/src/models/Trigger');

  await TriggerModel.deleteMany({});

  await TriggerModel.insertMany([
    {
      name: 'Stablecoin Transfer Alert',
      description: 'Notify Discord on any stablecoin transfer',
      status: 'active',
      filter: { eventType: 'transfer' },
      actionType: 'discord',
      actionConfig: {
        webhookUrl: 'https://discord.com/api/webhooks/REPLACE_ME',
        messageTemplate: '💸 Transfer detected on ledger {{ledger}} — tx: {{txHash}}',
      },
      batching: { enabled: false, windowMs: 5000, maxBatchSize: 10, continueOnError: true },
      maxRetries: 3,
    },
    {
      name: 'High Fee Alert',
      description: 'Webhook when gas fees spike',
      status: 'active',
      filter: { eventType: 'high_fee' },
      actionType: 'webhook',
      actionConfig: {
        url: 'https://example.com/hooks/fee-alert',
        method: 'POST',
      },
      batching: { enabled: true, windowMs: 10000, maxBatchSize: 5, continueOnError: true },
      maxRetries: 3,
    },
    {
      name: 'NFT Sale Telegram',
      description: 'Telegram message on NFT sale',
      status: 'paused',
      filter: { eventType: 'nft_sale' },
      actionType: 'telegram',
      actionConfig: {
        chatId: '-100REPLACE',
        messageTemplate: '🎨 NFT sold on ledger {{ledger}}',
      },
      batching: { enabled: false, windowMs: 5000, maxBatchSize: 10, continueOnError: true },
      maxRetries: 3,
    },
  ]);

  console.log('✅ Seed data inserted');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
