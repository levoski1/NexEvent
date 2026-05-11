#!/usr/bin/env bash
set -euo pipefail

echo "🚀 NexEvent local setup"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 20+ required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }

# Copy env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📋 .env created from .env.example — fill in your values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start infrastructure
echo "🐳 Starting MongoDB + Redis..."
docker compose -f infrastructure/docker-compose.yml up -d mongo redis

# Wait for services
echo "⏳ Waiting for services..."
sleep 5

# Seed database
echo "🌱 Seeding database..."
npx ts-node infrastructure/scripts/seed.ts || echo "⚠️  Seed failed (may already be seeded)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Start development:"
echo "  npm run dev"
echo ""
echo "Services:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:4000"
echo "  Swagger:   http://localhost:4000/api/docs"
echo "  MongoDB:   mongodb://localhost:27017/nexevent"
echo "  Redis:     localhost:6379"
