const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔗 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('📡 Testing basic connection...')
    const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Connection successful! (Table user_profiles does not exist yet - this is expected)')
      } else {
        console.error('❌ Connection error:', error.message)
        return false
      }
    } else {
      console.log('✅ Connection successful! Found existing data.')
    }

    // Test auth
    console.log('🔐 Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.error('❌ Auth error:', authError.message)
      return false
    }
    
    console.log('✅ Authentication system working!')
    console.log('📋 Connection test completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Ready to set up database schema!')
    console.log('Next steps:')
    console.log('1. Go to https://gfcpxjuehifwyleylege.supabase.co')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the setup scripts in order:')
    console.log('   - supabase-complete-setup.sql')
    console.log('   - supabase-storage-setup.sql')
    console.log('   - supabase-realtime-functions.sql')
  }
  process.exit(success ? 0 : 1)
})