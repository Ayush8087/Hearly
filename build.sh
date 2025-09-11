#!/bin/bash
# Build script for hosting platforms

echo "Installing dependencies..."
npm ci || npm install

echo "Generating Prisma client (production schema)..."
npx prisma generate --schema prisma/schema.production.prisma

echo "Applying database migrations..."
npx prisma migrate deploy --schema prisma/schema.production.prisma

echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"
