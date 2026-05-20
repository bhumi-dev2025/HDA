import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agjvnylhyfufmotphwaz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnanZueWxoeWZ1Zm1vdHBod2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTY3MzQsImV4cCI6MjA4MjIzMjczNH0.gedGjrQvfXMLjtejt8jqUoB_29uiu5iN1wi6R7tACHk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
    auth: {
    storage: AsyncStorage, // 2. Aa line thi login phone ma save thase
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})