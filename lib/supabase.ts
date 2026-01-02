import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://agjvnylhyfufmotphwaz.supabase.co'
const supabaseAnonKey = 'sb_publishable_zDkkFK3evOXt0weM8eOfBQ_sJH0k_rc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
    auth: {
    storage: AsyncStorage, // 2. Aa line thi login phone ma save thase
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})