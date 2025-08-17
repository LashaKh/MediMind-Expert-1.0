#!/usr/bin/env node

/**
 * Check if liked_search_results table exists in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTable() {
  try {
    console.log('🔍 Checking if liked_search_results table exists...\n');

    // Check if table exists
    const { data: tables, error: tableError } = await supabase
      .from('liked_search_results')
      .select('*')
      .limit(1);

    if (tableError) {
      if (tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
        console.error('❌ Table "liked_search_results" does not exist!');
        console.log('\n📝 Please run the migration:');
        console.log('   src/database/migrations/006_liked_search_results.sql\n');
        return;
      }
      console.error('❌ Error checking table:', tableError.message);
      return;
    }

    console.log('✅ Table "liked_search_results" exists!\n');

    // Get table schema
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'liked_search_results' })
      .select('*');

    if (!schemaError && columns) {
      console.log('📊 Table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    }

    // Count existing records
    const { count, error: countError } = await supabase
      .from('liked_search_results')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📈 Total records: ${count || 0}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// If the RPC function doesn't exist, create this alternative check
async function alternativeCheck() {
  try {
    const { data, error } = await supabase
      .rpc('get_schema_info', {
        schema_name: 'public',
        table_name: 'liked_search_results'
      });

    if (error) {
      // Try a simpler query
      const { data: testData, error: testError } = await supabase
        .from('liked_search_results')
        .select('id')
        .limit(0);

      if (testError) {
        console.log('\n⚠️  Table check failed:', testError.message);
      } else {
        console.log('\n✅ Table structure appears valid');
      }
    }
  } catch (err) {
    // Ignore RPC errors
  }
}

checkTable().then(() => alternativeCheck());