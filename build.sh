#!/bin/bash
# Build script for hosting platforms

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"
