# PostgreSQL Setup for Hearly

Your playlists are getting lost because SQLite resets on every deployment. Follow these steps to switch to PostgreSQL for persistent storage.

## Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Choose a name (e.g., "hearly-db")
4. Select the free tier
5. Click "Create Database"
6. Wait for it to be ready

## Step 2: Get Database Connection String

1. Click on your new database
2. Go to "Connections" tab
3. Copy the "External Database URL"
4. It should look like: `postgresql://username:password@hostname:port/database`

## Step 3: Set Environment Variables

1. Go to your Hearly web service on Render
2. Click "Environment"
3. Add/Update these variables:
   - `DATABASE_URL`: Paste the PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate one with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Render app URL (e.g., `https://hearly.onrender.com`)

## Step 4: Deploy and Migrate

1. The code is already updated to use PostgreSQL
2. Deploy your app (it will automatically build)
3. After deployment, run this command in Render's shell:
   ```bash
   npx prisma migrate deploy
   ```

## Step 5: Test

1. Go to your deployed app
2. Register a new account
3. Create a playlist and add songs
4. Redeploy - your data should persist!

## Troubleshooting

- If migration fails, check the DATABASE_URL format
- Make sure the PostgreSQL database is running
- Check Render logs for any errors

## Local Development

For local development, you can use a local PostgreSQL or continue with SQLite by changing the provider back to "sqlite" in `prisma/schema.prisma`.
