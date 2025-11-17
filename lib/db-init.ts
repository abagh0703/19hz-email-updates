// This script initializes the Supabase database with the schema
// Run this once to set up all tables and seed data

import { getSupabaseClient } from './supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initDatabase() {
  try {
    const supabase = getSupabaseClient();
    const schemaPath = join(process.cwd(), 'supabase-schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('Initializing database schema...');
    
    // Split the SQL into individual statements and execute them
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
      }
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { initDatabase };


