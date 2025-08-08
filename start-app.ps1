# Start Application Script for CodeQuest
# This script sets up the environment and starts the application

Write-Host "🚀 Starting CodeQuest Application..." -ForegroundColor Green

# Set the environment variable
$env:DATABASE_URL = "postgresql://neondb_owner:npg_R9b3nAIVqtmZ@ep-twilight-flower-acst0c0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "✅ Environment variable DATABASE_URL has been set." -ForegroundColor Yellow
Write-Host "🗄️  Using Neon PostgreSQL database" -ForegroundColor Cyan

# Start the development server
Write-Host "🌐 Starting development server..." -ForegroundColor Green
npm run dev

