# Database Setup Script for CodeQuest
# This script sets up the environment variable and tests the database connection

Write-Host "Setting up Neon PostgreSQL database connection..." -ForegroundColor Green

# Set the environment variable
$env:DATABASE_URL = "postgresql://neondb_owner:npg_R9b3nAIVqtmZ@ep-twilight-flower-acst0c0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "Environment variable DATABASE_URL has been set." -ForegroundColor Yellow
Write-Host "Database URL: $env:DATABASE_URL" -ForegroundColor Cyan

# Run database migration
Write-Host "Running database migration..." -ForegroundColor Green
npm run db:push

Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "You can now start the application with: npm run dev" -ForegroundColor Yellow

