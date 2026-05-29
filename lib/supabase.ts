import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
    auth: {
    storage: AsyncStorage, // 2. Aa line thi login phone ma save thase
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})