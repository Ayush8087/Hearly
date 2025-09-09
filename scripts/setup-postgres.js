#!/usr/bin/env node

/**
 * Setup script for PostgreSQL migration on Render
 * Run this after setting up PostgreSQL database on Render
 */

const { execSync } = require('child_process');

console.log('🚀 Setting up PostgreSQL for Hearly...\n');

try {
  // Generate Prisma client
  console.log('1. Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Create and apply migration
  console.log('2. Creating migration...');
  execSync('npx prisma migrate dev --name init_postgres', { stdio: 'inherit' });
  
  console.log('\n✅ PostgreSQL setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Create a PostgreSQL database on Render');
  console.log('2. Set DATABASE_URL in Render environment variables');
  console.log('3. Deploy your app');
  console.log('4. Run: npx prisma migrate deploy (on Render)');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
