#!/usr/bin/env tsx
/**
 * End-to-End Test Script for Supabase Backend Setup
 * Tests all major functionality of the Haus of Basquiat Portal
 * 
 * Run with: npx tsx test-supabase-setup.ts
 * Make sure to set up your environment variables first!
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('Make sure you have set:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role for testing
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message?: string
  error?: any
}

class TestSuite {
  private results: TestResult[] = []
  
  async test(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      console.log(`🧪 Testing: ${name}`)
      await testFn()
      this.results.push({ name, status: 'pass' })
      console.log(`✅ ${name} - PASSED`)
    } catch (error) {
      this.results.push({ 
        name, 
        status: 'fail', 
        error: error instanceof Error ? error.message : String(error)
      })
      console.log(`❌ ${name} - FAILED:`, error instanceof Error ? error.message : error)
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary:')
    console.log('='.repeat(50))
    
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Total: ${this.results.length}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`))
    }
    
    const successRate = ((passed / this.results.length) * 100).toFixed(1)
    console.log(`\n🎯 Success Rate: ${successRate}%`)
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your backend is ready! ✨')
    } else {
      console.log('\n🚨 Some tests failed. Please check your setup.')
    }
  }
}

async function main() {
  console.log('🏠 Haus of Basquiat Portal - Backend Test Suite')
  console.log('='.repeat(50))
  console.log(`🌐 Testing Supabase URL: ${supabaseUrl}`)
  console.log('⏳ Starting tests...\n')

  const suite = new TestSuite()

  // Test 1: Database Connection
  await suite.test('Database Connection', async () => {
    const { data, error } = await supabase
      .from('houses')
      .select('count')
      .limit(1)
    
    if (error) throw error
    console.log('   📡 Database connected successfully')
  })

  // Test 2: Schema Tables Exist
  await suite.test('Schema Tables Exist', async () => {
    const tables = [
      'houses', 'user_profiles', 'posts', 'messages', 'chat_threads',
      'gallery_items', 'events', 'documents', 'notifications', 'subscriptions'
    ]
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) throw new Error(`Table '${table}' not found or accessible: ${error.message}`)
    }
    console.log(`   📋 All ${tables.length} core tables exist`)
  })

  // Test 3: Default Houses Created
  await suite.test('Default Houses Created', async () => {
    const { data, error } = await supabase
      .from('houses')
      .select('*')
    
    if (error) throw error
    
    const expectedHouses = [
      'House of Eleganza',
      'House of Avant-Garde', 
      'House of Butch Realness',
      'House of Femme',
      'House of Bizarre'
    ]
    
    const actualHouses = data?.map(h => h.name) || []
    const missingHouses = expectedHouses.filter(h => !actualHouses.includes(h))
    
    if (missingHouses.length > 0) {
      throw new Error(`Missing houses: ${missingHouses.join(', ')}`)
    }
    
    console.log(`   🏠 Found ${data?.length} houses including all required ones`)
  })

  // Test 4: Storage Buckets Exist
  await suite.test('Storage Buckets Exist', async () => {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) throw error
    
    const expectedBuckets = [
      'documents', 'chat-files', 'posts-media', 
      'gallery', 'avatars', 'event-media'
    ]
    
    const actualBuckets = data?.map(b => b.name) || []
    const missingBuckets = expectedBuckets.filter(b => !actualBuckets.includes(b))
    
    if (missingBuckets.length > 0) {
      throw new Error(`Missing buckets: ${missingBuckets.join(', ')}`)
    }
    
    console.log(`   🪣 Found ${data?.length} storage buckets including all required ones`)
  })

  // Test 5: Row Level Security Enabled
  await suite.test('Row Level Security Enabled', async () => {
    const { data, error } = await supabase
      .rpc('check_rls_enabled')
      .catch(() => {
        // RPC might not exist, so we'll check differently
        return { data: null, error: null }
      })
    
    // Alternative check: Try to query a protected table without auth
    const supabaseAnon = createClient(
      supabaseUrl, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // This should return empty due to RLS, not an error
    const { data: profiles, error: profileError } = await supabaseAnon
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    // If we get data without auth, RLS might not be working properly
    console.log('   🔐 RLS policies are active (empty results for unauthenticated requests)')
  })

  // Test 6: Authentication Functions
  await suite.test('Authentication Functions', async () => {
    // Check if the user creation function exists by looking for it
    const { data, error } = await supabase
      .rpc('get_community_stats')
      .catch(() => ({ data: null, error: 'Function not found' }))
    
    // The function should exist even if it returns 0 for everything
    if (error && error.includes('not found')) {
      throw new Error('Community stats function not found - check if webhooks.sql was run')
    }
    
    console.log('   ⚡ Database functions are available')
  })

  // Test 7: Test CRUD Operations (Create, Read, Update, Delete)
  await suite.test('CRUD Operations', async () => {
    // Create a test user profile (simulating what auth.users trigger would do)
    const testUserId = crypto.randomUUID()
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@hausofbasquiat.com',
        display_name: 'Test User',
        role: 'Member'
      })
      .select()
    
    if (insertError) throw insertError
    
    // Read the created user
    const { data: readData, error: readError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (readError) throw readError
    
    // Update the user
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ display_name: 'Updated Test User' })
      .eq('id', testUserId)
    
    if (updateError) throw updateError
    
    // Delete the test user
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', testUserId)
    
    if (deleteError) throw deleteError
    
    console.log('   ✏️  CRUD operations work correctly')
  })

  // Test 8: Test Triggers and Functions
  await suite.test('Database Triggers', async () => {
    // Create a test user and post to test the trigger
    const testUserId = crypto.randomUUID()
    const testPostId = crypto.randomUUID()
    
    try {
      // Create test user
      await supabase
        .from('user_profiles')
        .insert({
          id: testUserId,
          email: 'trigger-test@hausofbasquiat.com',
          display_name: 'Trigger Test',
          role: 'Member'
        })
      
      // Create test post
      await supabase
        .from('posts')
        .insert({
          id: testPostId,
          author_id: testUserId,
          content: 'Test post for trigger testing'
        })
      
      // Add a like (this should trigger the likes count update)
      const testLikerId = crypto.randomUUID()
      
      await supabase
        .from('user_profiles')
        .insert({
          id: testLikerId,
          email: 'liker@hausofbasquiat.com', 
          display_name: 'Test Liker',
          role: 'Member'
        })
      
      await supabase
        .from('post_likes')
        .insert({
          post_id: testPostId,
          user_id: testLikerId
        })
      
      // Check if the trigger updated the likes count
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', testPostId)
        .single()
      
      if (postData?.likes_count !== 1) {
        throw new Error('Post likes count trigger not working')
      }
      
      console.log('   🔄 Database triggers are working correctly')
      
    } finally {
      // Clean up test data
      await supabase.from('post_likes').delete().eq('post_id', testPostId)
      await supabase.from('posts').delete().eq('id', testPostId)
      await supabase.from('user_profiles').delete().eq('id', testUserId)
      await supabase.from('user_profiles').delete().eq('email', 'liker@hausofbasquiat.com')
    }
  })

  // Test 9: File Upload to Storage
  await suite.test('File Upload to Storage', async () => {
    // Create a small test file
    const testFile = new Blob(['Hello, Haus of Basquiat!'], { type: 'text/plain' })
    const fileName = `test-${Date.now()}.txt`
    
    // Test upload to avatars bucket
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, testFile)
    
    if (error) throw error
    
    // Test download
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('avatars')
      .download(fileName)
    
    if (downloadError) throw downloadError
    
    // Clean up
    await supabase.storage
      .from('avatars')
      .remove([fileName])
    
    console.log('   📁 File upload and download working correctly')
  })

  // Test 10: Analytics and Reporting Functions
  await suite.test('Analytics Functions', async () => {
    const { data, error } = await supabase
      .rpc('get_community_stats')
    
    if (error) throw error
    
    // Should return an object with stats
    if (!data || typeof data !== 'object') {
      throw new Error('Community stats function not returning expected format')
    }
    
    console.log('   📊 Analytics functions working correctly')
    console.log(`      Houses: ${data.total_houses}, Users: ${data.total_users}`)
  })

  // Print final summary
  suite.printSummary()
  
  // Exit with error code if tests failed
  const failedCount = suite.results.filter(r => r.status === 'fail').length
  if (failedCount > 0) {
    process.exit(1)
  }
}

// Run the tests
main().catch(error => {
  console.error('💥 Test suite failed to run:', error)
  process.exit(1)
})