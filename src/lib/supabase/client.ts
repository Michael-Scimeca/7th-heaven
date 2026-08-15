import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://acfzdcyqdskrmfuuoesb.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnpkY3lxZHNrcm1mdXVvZXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNDI1NjgsImV4cCI6MjA5MTYxODU2OH0.r9gKbsga7rDliDZOCxePGFvIgZRdFbcf4h1FYkZd9Sg';

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  }

  const win = window as any;
  if (!win.__supabaseClient) {
    win.__supabaseClient = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  }
  return win.__supabaseClient;
}
