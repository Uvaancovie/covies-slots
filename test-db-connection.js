import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const directString = process.env.DATABASE_DIRECT_URL;

console.log('Testing database connections...');
console.log('DATABASE_URL:', connectionString ? connectionString.replace(/:.*@/, ':***@') : 'NOT SET');
console.log('DATABASE_DIRECT_URL:', directString ? directString.replace(/:.*@/, ':***@') : 'NOT SET');

async function testConnection(name, url) {
  if (!url) {
    console.log(`❌ ${name}: URL not set`);
    return false;
  }

  try {
    const sql = postgres(url, {
      max: 1,
      connect_timeout: 10,
      ssl: 'require'
    });
    
    const result = await sql`SELECT 1 as test`;
    console.log(`✅ ${name}: Connected successfully`);
    
    // Try to list tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`📋 ${name}: Found ${tables.length} tables:`, tables.map(t => t.table_name));
    
    await sql.end();
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Connection failed`);
    console.log('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n=== Testing Pooler Connection ===');
  const poolerWorks = await testConnection('Pooler (DATABASE_URL)', connectionString);
  
  console.log('\n=== Testing Direct Connection ===');  
  const directWorks = await testConnection('Direct (DATABASE_DIRECT_URL)', directString);
  
  if (!poolerWorks && !directWorks) {
    console.log('\n❌ Both connections failed. Check your Supabase database status and credentials.');
  } else if (!directWorks) {
    console.log('\n⚠️  Direct connection failed - this is needed for migrations.');
  } else {
    console.log('\n✅ Database connections working!');
  }
}

main().catch(console.error);