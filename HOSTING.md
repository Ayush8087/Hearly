# MusicHub - Hosting Configuration Guide

## Common Hosting Issues Fixed

This guide addresses the common hosting errors you might encounter when deploying your MusicHub application.

## Environment Variables Required

Make sure to set these environment variables on your hosting platform:

```bash
# Database (use PostgreSQL for production)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-random-string"
NEXTAUTH_URL="https://your-app-domain.com"

# API
NEXT_PUBLIC_API_URL="https://saavn.dev/api/"
```

## Platform-Specific Instructions

### Render Deployment

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. For database: Create PostgreSQL addon or use external database

### Vercel Deployment

1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Database: Use Vercel Postgres or external PostgreSQL
4. Build command: `npm run build` (automatic)
5. Install command: `npm install` (automatic)

### Netlify Deployment

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard

## Database Setup

### For Production (PostgreSQL)

1. Create a PostgreSQL database
2. Update `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate deploy`

### Local Development (SQLite)

Create `.env.local`:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
```

## Common Errors and Solutions

### "Prisma Client not generated"
- Solution: Ensure `postinstall` script runs `prisma generate`
- Manual fix: Run `npx prisma generate`

### "Database connection failed"
- Check DATABASE_URL format
- Ensure database is accessible from hosting platform
- For PostgreSQL: `postgresql://user:password@host:port/database`

### "NextAuth configuration error"
- Set NEXTAUTH_SECRET (use `openssl rand -base64 32`)
- Set NEXTAUTH_URL to your production domain
- Ensure callbacks are properly configured

### "Build fails on hosting platform"
- Check build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## Build Commands

- Development: `npm run dev`
- Production build: `npm run build`
- Start production: `npm start`
- Generate Prisma: `npx prisma generate`
- Database migration: `npx prisma migrate deploy`

## Troubleshooting

1. Check build logs on your hosting platform
2. Verify all environment variables are set
3. Ensure database is properly configured
4. Test API endpoints independently
5. Check console for client-side errors

## Support

If you continue experiencing issues, check:
1. Hosting platform documentation
2. Next.js deployment guides
3. Prisma deployment documentation
