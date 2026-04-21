'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestSupabasePage() {
 const { user, profile, isLoading, isAuthenticated, role, signUp, signIn, signOut } = useAuth();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [name, setName] = useState('');
 const [dob, setDob] = useState('1990-01-01');
 const [message, setMessage] = useState('');
 const [dbTest, setDbTest] = useState<string>('');
 const [mode, setMode] = useState<'signin' | 'signup'>('signin');

 const testConnection = async () => {
  try {
   const supabase = createClient();
   const { data, error } = await supabase.from('profiles').select('count').limit(1);
   if (error) {
    setDbTest(`❌ DB Error: ${error.message}`);
   } else {
    setDbTest(`✅ Connected! Profiles table accessible. Response: ${JSON.stringify(data)}`);
   }
  } catch (err) {
   setDbTest(`❌ Connection failed: ${err}`);
  }
 };

 const handleAuth = async () => {
  setMessage('');
  if (mode === 'signup') {
   const { error } = await signUp(email, password, {
    full_name: name,
    date_of_birth: dob,
   });
   if (error) setMessage(`❌ ${error}`);
   else setMessage('✅ Check your email for confirmation link!');
  } else {
   const { error } = await signIn(email, password);
   if (error) setMessage(`❌ ${error}`);
   else setMessage('✅ Signed in!');
  }
 };

 return (
  <section className="py-32 min-h-screen bg-[var(--color-bg-primary)]">
   <div className="max-w-2xl mx-auto px-6">
    <h1 className="text-3xl font-bold mb-2">🔧 Supabase Test</h1>
    <p className="text-white/40 mb-8">Verify your connection, auth, and database are working.</p>

    {/* Connection Test */}
    <div className="mb-8 p-6 bg-white/[0.03] border border-white/10 rounded-xl">
     <h2 className="text-lg font-bold mb-3">1. Database Connection</h2>
     <button
      onClick={testConnection}
      className="px-6 py-3 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:brightness-110 transition-all cursor-pointer"
     >
      Test Connection
     </button>
     {dbTest && <p className="mt-3 text-sm font-mono">{dbTest}</p>}
    </div>

    {/* Auth Test */}
    <div className="mb-8 p-6 bg-white/[0.03] border border-white/10 rounded-xl">
     <h2 className="text-lg font-bold mb-3">2. Authentication</h2>

     {isLoading ? (
      <p className="text-white/40">Loading...</p>
     ) : isAuthenticated ? (
      <div>
       <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
        <p className="text-emerald-400 font-bold">✅ Signed in as:</p>
        <p className="text-sm text-white/60 mt-1">{user?.email}</p>
        <p className="text-sm text-white/60">Role: <span className="font-bold text-white">{role}</span></p>
        <p className="text-sm text-white/60">User ID: <span className="font-mono text-[0.7rem]">{user?.id}</span></p>
       </div>

       {profile && (
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg mb-4">
         <p className="text-xs uppercase tracking-wider text-white/30 font-bold mb-2">Profile Data</p>
         <pre className="text-[0.7rem] text-white/50 overflow-x-auto">
          {JSON.stringify(profile, null, 2)}
         </pre>
        </div>
       )}

       <button
        onClick={signOut}
        className="px-6 py-3 border border-red-500/30 text-red-400 font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
       >
        Sign Out
       </button>
      </div>
     ) : (
      <div className="space-y-4">
       <div className="flex gap-2 mb-4">
        <button
         onClick={() => setMode('signin')}
         className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${mode === 'signin' ? 'bg-[var(--color-accent)] text-white' : 'bg-white/[0.05] text-white/40'}`}
        >
         Sign In
        </button>
        <button
         onClick={() => setMode('signup')}
         className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-[var(--color-accent)] text-white' : 'bg-white/[0.05] text-white/40'}`}
        >
         Sign Up
        </button>
       </div>

       {mode === 'signup' && (
        <>
         <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-accent)] outline-none"
         />
         <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[var(--color-accent)] outline-none"
         />
        </>
       )}

       <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-accent)] outline-none"
       />
       <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[var(--color-accent)] outline-none"
       />
       <button
        onClick={handleAuth}
        className="w-full px-6 py-3 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:brightness-110 transition-all cursor-pointer"
       >
        {mode === 'signup' ? 'Create Account' : 'Sign In'}
       </button>
       {message && <p className="text-sm font-semibold">{message}</p>}
      </div>
     )}
    </div>

    {/* Status Summary */}
    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
     <h2 className="text-lg font-bold mb-3">3. Status</h2>
     <div className="space-y-2 text-sm">
      <p>Supabase URL: <span className="font-mono text-[var(--color-accent)]">{process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</span></p>
      <p>Anon Key: <span className="font-mono text-[var(--color-accent)]">{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</span></p>
      <p>Auth State: <span className="font-mono">{isLoading ? '⏳ Loading' : isAuthenticated ? '✅ Authenticated' : '🔒 Not authenticated'}</span></p>
      <p>Profile Loaded: <span className="font-mono">{profile ? '✅ Yes' : '❌ No'}</span></p>
     </div>
    </div>
   </div>
  </section>
 );
}
