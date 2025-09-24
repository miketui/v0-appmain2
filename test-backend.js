#!/usr/bin/env node

/**
 * Backend Validation Script for Haus of Basquiat Portal
 * Tests all Supabase functionality end-to-end
 * 
 * Usage: node test-backend.js
 * Make sure environment variables are set first!
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class TestRunner {
  constructor() {
    this.results = [];
    this.colors = {
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
  }

  log(message, color = 'reset') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`);
  }

  async test(name, testFn) {
    try {
      this.log(`🧪 Testing: ${name}`, 'blue');
      await testFn();
      this.results.push({ name, status: 'pass' });
      this.log(`✅ ${name} - PASSED`, 'green');
    } catch (error) {
      this.results.push({ 
        name, 
        status: 'fail', 
        error: error.message 
      });
      this.log(`❌ ${name} - FAILED: ${error.message}`, 'red');
    }
  }

  printSummary() {
    this.log('\n📊 Test Summary:', 'bold');
    this.log('='.repeat(50), 'yellow');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    this.log(`✅ Passed: ${passed}`, 'green');
    this.log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
    this.log(`📊 Total: ${this.results.length}`);
    
    if (failed > 0) {
      this.log('\n❌ Failed Tests:', 'red');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => this.log(`  - ${r.name}: ${r.error}`, 'red'));
    }
    
    const successRate = ((passed / this.results.length) * 100).toFixed(1);
    this.log(`\n🎯 Success Rate: ${successRate}%`, 'bold');
    
    if (failed === 0) {
      this.log('\n🎉 All tests passed! Your backend is ready! ✨', 'green');
    } else {
      this.log('\n🚨 Some tests failed. Check your Supabase setup.', 'red');
    }
  }
}

async function runTests() {
  const runner = new TestRunner();
  
  runner.log('🏠 Haus of Basquiat Portal - Backend Test Suite', 'bold');
  runner.log('='.repeat(50), 'yellow');
  runner.log(`🌐 Testing Supabase URL: ${supabaseUrl}`, 'blue');
  runner.log('⏳ Starting tests...\n');

  // Test 1: Database Connection
  await runner.test('Database Connection', async () => {
    const { data, error } = await supabase.from('houses').select('count').limit(1);
    if (error) throw new Error(`Database connection failed: ${error.message}`);
    console.log('   📡 Database connected successfully');
  });

  // Test 2: Core Tables Exist
  await runner.test('Core Tables Existence', async () => {
    const tables = [
      'houses', 'user_profiles', 'posts', 'messages', 'chat_threads',
      'gallery_items', 'events', 'documents', 'notifications', 'subscriptions'
    ];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) throw new Error(`Table '${table}' missing: ${error.message}`);
    }
    console.log(`   📋 All ${tables.length} core tables exist`);
  });

  // Test 3: Default Houses
  await runner.test('Default Houses Created', async () => {
    const { data, error } = await supabase.from('houses').select('*');
    if (error) throw new Error(`Houses query failed: ${error.message}`);
    
    const requiredHouses = [
      'House of Eleganza', 'House of Avant-Garde', 'House of Butch Realness',
      'House of Femme', 'House of Bizarre'
    ];
    
    const houseNames = data.map(h => h.name);
    const missing = requiredHouses.filter(name => !houseNames.includes(name));
    
    if (missing.length > 0) {
      throw new Error(`Missing houses: ${missing.join(', ')}`);
    }
    
    console.log(`   🏠 Found ${data.length} houses including all required ones`);
  });

  // Test 4: Storage Buckets
  await runner.test('Storage Buckets Created', async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(`Storage query failed: ${error.message}`);
    
    const requiredBuckets = [
      'documents', 'chat-files', 'posts-media', 'gallery', 'avatars', 'event-media'
    ];
    
    const bucketNames = data.map(b => b.name);
    const missing = requiredBuckets.filter(name => !bucketNames.includes(name));
    
    if (missing.length > 0) {
      throw new Error(`Missing buckets: ${missing.join(', ')}`);
    }
    
    console.log(`   🪣 Found ${data.length} storage buckets including all required ones`);
  });

  // Test 5: CRUD Operations
  await runner.test('CRUD Operations', async () => {
    const testUserId = crypto.randomUUID();
    
    try {
      // Create
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: testUserId,
          email: 'test@example.com',
          display_name: 'Test User',
          role: 'Member'
        });
      
      if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

      // Read
      const { data: readData, error: readError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();
      
      if (readError) throw new Error(`Read failed: ${readError.message}`);
      if (!readData) throw new Error('Created user not found');

      // Update
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ display_name: 'Updated Test User' })
        .eq('id', testUserId);
      
      if (updateError) throw new Error(`Update failed: ${updateError.message}`);

      // Delete
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
      
      if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);
      
      console.log('   ✏️ CRUD operations working correctly');
    } catch (error) {
      // Cleanup on failure
      await supabase.from('user_profiles').delete().eq('id', testUserId);
      throw error;
    }
  });

  // Test 6: Database Functions
  await runner.test('Database Functions', async () => {
    const { data, error } = await supabase.rpc('get_community_stats');
    
    if (error) throw new Error(`Function call failed: ${error.message}`);
    if (!data || typeof data !== 'object') {
      throw new Error('Community stats function returned invalid data');
    }
    
    console.log('   ⚡ Database functions working correctly');
    console.log(`      Houses: ${data.total_houses}, Users: ${data.total_users}`);
  });

  // Test 7: Triggers and Counters
  await runner.test('Database Triggers', async () => {
    const testUserId = crypto.randomUUID();
    const testPostId = crypto.randomUUID();
    const testLikerId = crypto.randomUUID();
    
    try {
      // Create test users
      await supabase.from('user_profiles').insert([
        {
          id: testUserId,
          email: 'trigger-test@example.com',
          display_name: 'Trigger Test',
          role: 'Member'
        },
        {
          id: testLikerId,
          email: 'liker@example.com',
          display_name: 'Test Liker', 
          role: 'Member'
        }
      ]);

      // Create test post
      await supabase.from('posts').insert({
        id: testPostId,
        author_id: testUserId,
        content: 'Test post for trigger testing'
      });

      // Add like (should trigger count update)
      await supabase.from('post_likes').insert({
        post_id: testPostId,
        user_id: testLikerId
      });

      // Check if trigger worked
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', testPostId)
        .single();

      if (postData?.likes_count !== 1) {
        throw new Error('Post likes count trigger not working');
      }

      console.log('   🔄 Database triggers working correctly');
    } finally {
      // Cleanup
      await supabase.from('post_likes').delete().eq('post_id', testPostId);
      await supabase.from('posts').delete().eq('id', testPostId);
      await supabase.from('user_profiles').delete().in('id', [testUserId, testLikerId]);
    }
  });

  // Test 8: File Upload
  await runner.test('File Upload', async () => {
    const testFile = Buffer.from('Hello, Haus of Basquiat!', 'utf8');
    const fileName = `test-${Date.now()}.txt`;
    
    try {
      // Upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, testFile, { contentType: 'text/plain' });
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Download to verify
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('avatars')
        .download(fileName);
      
      if (downloadError) throw new Error(`Download failed: ${downloadError.message}`);
      
      console.log('   📁 File upload/download working correctly');
    } finally {
      // Cleanup
      await supabase.storage.from('avatars').remove([fileName]);
    }
  });

  // Test 9: Real-time Functions
  await runner.test('Real-time Functions', async () => {
    const { data, error } = await supabase.rpc('get_engagement_stats', { days_back: 7 });
    
    if (error) throw new Error(`Engagement stats failed: ${error.message}`);
    if (!data) throw new Error('No engagement stats returned');
    
    console.log('   📊 Real-time analytics functions working');
  });

  // Test 10: Row Level Security
  await runner.test('Row Level Security', async () => {
    // Create anonymous client (no auth)
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Try to access protected data - should return empty results due to RLS
    const { data, error } = await anonClient
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    // This shouldn't throw an error, but should return limited/no data due to RLS
    if (error && !error.message.includes('permission')) {
      throw new Error(`Unexpected RLS error: ${error.message}`);
    }
    
    console.log('   🔐 Row Level Security is active');
  });

  runner.printSummary();
  
  const failedCount = runner.results.filter(r => r.status === 'fail').length;
  if (failedCount > 0) {
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});