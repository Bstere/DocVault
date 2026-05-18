import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oguvjvdoirfwexnhkqnf.supabase.co'
const supabaseAnonKey = 'sb_publishable_vvvryO7vRZaml_870oaJyQ_n9pEmNAw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
