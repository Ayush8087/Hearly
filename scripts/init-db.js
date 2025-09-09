#!/usr/bin/env node

/**
 * Initialize database tables for production
 * Run this on Render after deployment
 */

const { PrismaClient } = require('@prisma/client');

async function initDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Create tables by running a simple query
    await prisma.user.findMany({ take: 1 });
    console.log('✅ User table exists');
    
    await prisma.playlist.findMany({ take: 1 });
    console.log('✅ Playlist table exists');
    
    await prisma.playlistSong.findMany({ take: 1 });
    console.log('✅ PlaylistSong table exists');
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    if (error.code === 'P2021') {
      console.log('💡 Tables do not exist. Running migration...');
      const { execSync } = require('child_process');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migration completed');
      } catch (migrateError) {
        console.error('❌ Migration failed:', migrateError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
