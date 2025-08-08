import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { clinicalCodes } from '@shared/schema';

const DATABASE_URL = 'postgresql://neondb_owner:npg_R9b3nAIVqtmZ@ep-twilight-flower-acst0c0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testDatabase() {
  console.log('🧪 Testing database connection...');
  
  try {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);
    
    console.log('✅ Database connection successful!');
    
    // Test query
    const codes = await db.select().from(clinicalCodes);
    console.log(`📊 Found ${codes.length} clinical codes in database`);
    
    if (codes.length > 0) {
      console.log('\n📋 Sample codes:');
      codes.slice(0, 3).forEach(code => {
        console.log(`   ${code.codeType} - ${code.code}: ${code.description}`);
      });
    }
    
    // Test statistics
    const stats: Record<string, number> = {};
    for (const code of codes) {
      stats[code.codeType] = (stats[code.codeType] || 0) + 1;
    }
    
    console.log('\n📈 Database Statistics:');
    Object.entries(stats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log(`   Total: ${codes.length}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();

