# Vercel Deployment Guide

## Fixing the Database Connection Issue

Your Vercel deployment is currently using in-memory storage instead of the PostgreSQL database. Here's how to fix it:

### Step 1: Add Environment Variable in Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your CodeQuest project**
3. **Go to Settings → Environment Variables**
4. **Click "Add New"**
5. **Fill in the details:**
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_R9b3nAIVqtmZ@ep-twilight-flower-acst0c0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - **Environment**: Select all three options:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

6. **Click "Save"**

### Step 2: Redeploy Your Application

1. **Go to the "Deployments" tab**
2. **Find your latest deployment**
3. **Click the three dots (⋮) menu**
4. **Select "Redeploy"**
5. **Wait for the deployment to complete**

### Step 3: Verify the Fix

After redeployment, your application should:

✅ **Use PostgreSQL Storage**: The console will show "Database Storage: PostgreSQL (Neon)"  
✅ **Show Real Data**: The frontend will display data from your Neon database  
✅ **Correct Statistics**: Database stats will match your actual data (8 codes)  
✅ **Persistent Storage**: All data will be saved to the database  

### Expected Console Output

When the application starts, you should see:
```
🗄️  Database Storage: PostgreSQL (Neon)
🔗 DATABASE_URL: Set
```

### Troubleshooting

**If you still see in-memory storage:**

1. **Check Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Verify `DATABASE_URL` is set correctly
   - Make sure it's enabled for all environments (Production, Preview, Development)

2. **Redeploy After Changes:**
   - Go to Deployments tab
   - Click "Redeploy" on your latest deployment
   - Wait for deployment to complete

3. **Check the Debug Endpoint:**
   - Visit: `https://your-app.vercel.app/api/debug`
   - This will show you the current environment status
   - Check if `DATABASE_URL_EXISTS` is `true`

4. **Verify Environment Variable Format:**
   - Make sure there are no extra spaces in the value
   - Ensure the connection string is complete
   - Check that special characters are properly encoded

**If you see database connection errors:**

1. **Check Neon Database Status:**
   - Go to https://console.neon.tech
   - Verify your database is active and running
   - Check that the connection string is correct

2. **Test Database Connection:**
   - Run locally: `npm run db:test-vercel`
   - This will test the exact connection string

3. **Check Network Access:**
   - Ensure your Neon database allows external connections
   - Verify the connection string includes `sslmode=require`

### Debug Steps

**Step 1: Check the Debug Endpoint**
Visit: `https://your-app.vercel.app/api/debug`

Expected output:
```json
{
  "environment": {
    "NODE_ENV": "production",
    "DATABASE_URL_EXISTS": true,
    "DATABASE_URL_LENGTH": 150,
    "DATABASE_URL_PREFIX": "postgresql://neondb..."
  },
  "storage": {
    "type": "PostgresStorage",
    "isPostgres": true,
    "totalCodes": 8
  },
  "database": {
    "stats": {
      "ICD-10": 4,
      "ICD-9": 1,
      "CPT": 1,
      "SNOMED": 1,
      "HCC": 1
    }
  }
}
```

**Step 2: Check Vercel Logs**
- Go to Vercel Dashboard → Deployments → Latest Deployment → Functions
- Look for console logs showing database storage type
- Check for any error messages

**Step 3: Force Redeploy**
- Make a small change to your code (add a comment)
- Commit and push to trigger a new deployment
- This ensures the environment variables are properly loaded

### Database Status Check

You can verify your database is working by:
1. Going to your Neon dashboard: https://console.neon.tech
2. Checking the `clinical_codes` table has 8 records
3. Verifying the connection is active

### Environment Variable Details

- **Name**: `DATABASE_URL`
- **Value**: Your Neon PostgreSQL connection string
- **Purpose**: Tells the application to use PostgreSQL instead of in-memory storage
- **Required**: Yes, for production deployment

### Security Notes

- The connection string includes your database credentials
- Vercel encrypts environment variables at rest
- The connection uses SSL encryption for security
- Channel binding is enabled for additional protection
