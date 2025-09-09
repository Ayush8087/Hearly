const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Creating test user...');
    
    // Check if test user exists
    const existing = await prisma.user.findUnique({ 
      where: { email: 'test@example.com' } 
    });
    
    if (existing) {
      console.log('✅ Test user already exists');
      return;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword
      }
    });
    
    console.log('✅ Test user created:', user.email);
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
