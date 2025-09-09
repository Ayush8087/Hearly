# Build script for hosting platforms (PowerShell version)

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Generating Prisma client..." -ForegroundColor Green
npx prisma generate

Write-Host "Building Next.js application..." -ForegroundColor Green
npm run build

Write-Host "Build completed successfully!" -ForegroundColor Green
