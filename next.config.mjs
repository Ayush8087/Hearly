/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://hearly.onrender.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://hearly-s1u6.onrender.com/',
<<<<<<< HEAD
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development',
=======
>>>>>>> aac5e5c99d29ce4062c707ccf48adb7765a94241
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
};

export default nextConfig;
