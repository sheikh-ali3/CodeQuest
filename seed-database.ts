import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { clinicalCodes } from '@shared/schema';
import { type InsertClinicalCode } from '@shared/schema';

const DATABASE_URL = 'postgresql://neondb_owner:npg_R9b3nAIVqtmZ@ep-twilight-flower-acst0c0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sampleCodes: InsertClinicalCode[] = [
  {
    codeType: 'ICD-10',
    code: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
    synonyms: ['T2DM', 'Diabetes Mellitus Type II', 'NIDDM'],
    category: 'Endocrine Disorders'
  },
  {
    codeType: 'ICD-10',
    code: 'E11.65',
    description: 'Type 2 diabetes mellitus with hyperglycemia',
    synonyms: ['T2DM with hyperglycemia', 'Diabetic hyperglycemia'],
    category: 'Endocrine Disorders'
  },
  {
    codeType: 'ICD-9',
    code: '250.00',
    description: 'Diabetes mellitus without mention of complication',
    synonyms: ['DM', 'Diabetes'],
    category: 'Endocrine Disorders'
  },
  {
    codeType: 'CPT',
    code: '99213',
    description: 'Office or other outpatient visit for the evaluation and management of an established patient',
    synonyms: ['Established patient visit', 'Office visit level 3'],
    category: 'Evaluation and Management'
  },
  {
    codeType: 'SNOMED',
    code: '44054006',
    description: 'Diabetes mellitus type 2',
    synonyms: ['Type 2 diabetes', 'Non-insulin dependent diabetes'],
    category: 'Clinical Finding'
  },
  {
    codeType: 'HCC',
    code: '19',
    description: 'Diabetes without Complication',
    synonyms: ['DM without complications'],
    category: 'Risk Factor'
  },
  {
    codeType: 'ICD-10',
    code: 'I10',
    description: 'Essential hypertension',
    synonyms: ['High blood pressure', 'HTN', 'Primary hypertension'],
    category: 'Circulatory System'
  },
  {
    codeType: 'ICD-10',
    code: 'J44.1',
    description: 'Chronic obstructive pulmonary disease with acute exacerbation',
    synonyms: ['COPD exacerbation', 'Acute COPD'],
    category: 'Respiratory System'
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);
    
    console.log('📊 Checking existing data...');
    const existingCodes = await db.select().from(clinicalCodes);
    
    if (existingCodes.length > 0) {
      console.log(`⚠️  Database already contains ${existingCodes.length} codes. Skipping seeding.`);
      return;
    }
    
    console.log('📝 Inserting sample clinical codes...');
    
    for (const code of sampleCodes) {
      await db.insert(clinicalCodes).values(code);
      console.log(`✅ Inserted: ${code.codeType} - ${code.code} - ${code.description}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📈 Total codes inserted: ${sampleCodes.length}`);
    
    // Display summary
    const finalCodes = await db.select().from(clinicalCodes);
    const stats: Record<string, number> = {};
    
    for (const code of finalCodes) {
      stats[code.codeType] = (stats[code.codeType] || 0) + 1;
    }
    
    console.log('\n📊 Database Statistics:');
    Object.entries(stats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log(`   Total: ${finalCodes.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

