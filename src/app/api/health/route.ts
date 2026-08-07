import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getEnvStatus() {
  return {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendApiKey: !!process.env.RESEND_API_KEY,
    adminEmail: !!process.env.ADMIN_EMAIL,
    siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
  };
}

export async function GET() {
  // 1. Check Environment Variables (Return booleans, NEVER the actual keys)
  const envStatus = getEnvStatus();

  let dbConnected = false;
  let dbError = null;
  let dbLatency = 0;

  // 2. Check Database Connection & Latency
  if (envStatus.supabaseUrl && envStatus.supabaseAnonKey) {
    try {
      const startTime = Date.now();
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Attempt a lightweight query
      const { error } = await supabase.from('profiles').select('id').limit(1);
      dbLatency = Date.now() - startTime;

      if (!error) {
        dbConnected = true;
      } else {
        // Missing table or actual connection error
        dbError = error.message;
      }
    } catch (err: any) {
      dbError = err.message || 'Failed to connect';
    }
  } else {
    dbError = 'Missing Supabase URL or Key';
  }

  // Calculate overall system health
  const allEnvPresent = Object.values(envStatus).every(val => val === true);
  const status = (dbConnected && allEnvPresent) ? 'healthy' : 'degraded';

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      latencyMs: dbLatency,
      error: dbError
    },
    environment: envStatus
  });
}
