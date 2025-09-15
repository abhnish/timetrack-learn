import { createClient } from '@supabase/supabase-js'

// Check if Supabase credentials are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in your project settings.')
}

// Create client with fallback for development
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type UserRole = 'student' | 'faculty' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name: string
  student_id?: string
  department?: string
  created_at: string
  updated_at: string
}