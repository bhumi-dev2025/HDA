import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agjvnylhyfufmotphwaz.supabase.co'
const supabaseAnonKey = 'sb_publishable_zDkkFK3evOXt0weM8eOfBQ_sJH0k_rc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)