# Database Setup Guide

## Neon PostgreSQL Database Configuration

This project is now configured to use your Neon PostgreSQL database in the `sa-east-1` (São Paulo) region.

### Database Connection Details

- **Provider**: Neon PostgreSQL
- **Region**: sa-east-1 (São Paulo, Brazil)
- **Database**: neondb
- **Connection String**: Already configured in the system
- **Status**: ✅ **Connected and populated with 8 clinical codes**

### Quick Setup

1. **Set Environment Variable** (Windows PowerShell):
   ```powershell
   $env:DATABASE_URL="postgresql://neondb_owner:npg_R9b3nAIVqtmZ@ep-twilight-flower-acst0c0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```

2. **Or use the setup script**:
   ```powershell
   .\setup-db.ps1
   ```

3. **Start the application with database**:
   ```powershell
   .\start-app.ps1
   ```

### Database Schema

The following tables have been created in your Neon database:

1. **users** - User authentication and management
2. **clinical_codes** - Medical coding data (ICD-10, ICD-9, CPT, HCPCS, SNOMED, LOINC, HCC) - **8 codes loaded**
3. **search_history** - Search query tracking and analytics

### Current Database Status

✅ **Database Connected**: Neon PostgreSQL is active and responding  
✅ **Tables Created**: All schema tables are present  
✅ **Data Populated**: 8 sample clinical codes are loaded  
✅ **Statistics Match**: Frontend shows correct counts (ICD-10: 4, ICD-9: 1, CPT: 1, SNOMED: 1, HCC: 1, Total: 8)

### Available Commands

- `npm run db:push` - Apply database migrations
- `npm run db:seed` - Populate database with sample data
- `npm run db:test` - Test database connection and data
- `.\start-app.ps1` - Start application with database connection

### Features Now Available

- ✅ **Persistent Data Storage**: All data is now stored in your Neon PostgreSQL database
- ✅ **Search History**: User searches are tracked and stored
- ✅ **Clinical Code Management**: Full CRUD operations for medical codes
- ✅ **User Management**: User authentication and profiles
- ✅ **Analytics**: Code type statistics and search analytics
- ✅ **Real-time Search**: Fuzzy matching with synonym support

### Fallback Mode

If the `DATABASE_URL` environment variable is not set, the application will automatically fall back to in-memory storage for development purposes.

### Database Operations

The system now supports:
- Real-time search with fuzzy matching
- Bulk CSV uploads for clinical codes
- Search history tracking
- Code type filtering
- Export functionality

### Security Notes

- The database connection uses SSL encryption
- Channel binding is enabled for additional security
- Connection pooling is configured for optimal performance

### Monitoring

You can monitor your database usage through the Neon dashboard at: https://console.neon.tech

### Troubleshooting

If you see "8 codes" in the frontend but the database appears empty:
1. Make sure you're using `.\start-app.ps1` to start the application
2. Check that the environment variable is set: `echo $env:DATABASE_URL`
3. Test the database connection: `npm run db:test`
4. Verify data exists: `npm run db:seed` (will skip if data already exists)
