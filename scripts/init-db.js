const { PrismaClient } = require('@prisma/client');

async function initDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Initializing database...');
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test if tables exist by running a simple query
    await prisma.user.findMany({ take: 1 });
    console.log('✅ User table exists');
    
    await prisma.playlist.findMany({ take: 1 });
    console.log('✅ Playlist table exists');
    
    console.log('🎉 Database ready!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    if (error.code === 'P2021') {
      console.log('💡 Tables missing. Creating them...');
      const { execSync } = require('child_process');
      try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ Tables created successfully');
      } catch (migrateError) {
        console.error('❌ Failed to create tables:', migrateError.message);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();