import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ubtvqrlnmoqbqdkjpgyb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidHZxcmxubW9xYnFka2pwZ3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MjAzNzUsImV4cCI6MjEwMDk5NjM3NX0.sdIksM_q9ySXoT-LBj34zIDTVpRrpODJkJdeRBn3jZw'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
