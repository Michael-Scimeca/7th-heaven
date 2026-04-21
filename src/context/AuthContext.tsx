'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/lib/supabase/types';

interface AuthState {
 user: User | null;
 profile: Profile | null;
 session: Session | null;
 isLoading: boolean;
 isAuthenticated: boolean;
 role: UserRole;
}

interface AuthContextType extends AuthState {
 signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: string | null }>;
 signIn: (email: string, password: string) => Promise<{ error: string | null }>;
 signOut: () => Promise<void>;
 refreshProfile: () => Promise<void>;
}

interface SignUpMetadata {
 full_name: string;
 date_of_birth: string;
 phone?: string;
 zip?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [state, setState] = useState<AuthState>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  role: 'fan',
 });

 const supabase = createClient();

 const fetchProfile = useCallback(async (userId: string) => {
  const { data } = await supabase
   .from('profiles')
   .select('*')
   .eq('id', userId)
   .single();
  return data as Profile | null;
 }, [supabase]);

 const refreshProfile = useCallback(async () => {
  if (!state.user) return;
  const profile = await fetchProfile(state.user.id);
  if (profile) {
   setState(prev => ({ ...prev, profile, role: profile.role }));
  }
 }, [state.user, fetchProfile]);

 useEffect(() => {
  // Get initial session
  const initAuth = async () => {
   const { data: { session } } = await supabase.auth.getSession();
   if (session?.user) {
    const profile = await fetchProfile(session.user.id);
    setState({
     user: session.user,
     profile,
     session,
     isLoading: false,
     isAuthenticated: true,
     role: profile?.role ?? 'fan',
    });
   } else {
    setState(prev => ({ ...prev, isLoading: false }));
   }
  };

  initAuth();

  // Safety timeout — don't stay loading forever behind tunnel/proxy
  const authTimeout = setTimeout(() => {
   setState(prev => prev.isLoading ? { ...prev, isLoading: false } : prev);
  }, 3000);

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
   async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
     const profile = await fetchProfile(session.user.id);
     setState({
      user: session.user,
      profile,
      session,
      isLoading: false,
      isAuthenticated: true,
      role: profile?.role ?? 'fan',
     });
    } else if (event === 'SIGNED_OUT') {
     setState({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      role: 'fan',
     });
    }
   }
  );

  return () => { subscription.unsubscribe(); clearTimeout(authTimeout); };
 }, [supabase, fetchProfile]);

 const signUp = async (
  email: string,
  password: string,
  metadata: SignUpMetadata
 ): Promise<{ error: string | null }> => {
  // Validate age (18+)
  const dob = new Date(metadata.date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const isOldEnough = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && today.getDate() >= dob.getDate())));

  if (!isOldEnough) {
   return { error: 'You must be 18 years or older to create an account.' };
  }

  const { error } = await supabase.auth.signUp({
   email,
   password,
   options: {
    data: {
     full_name: metadata.full_name,
     date_of_birth: metadata.date_of_birth,
     phone: metadata.phone || null,
     zip: metadata.zip || null,
    },
   },
  });

  if (error) return { error: error.message };
  return { error: null };
 };

 const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
 };

 const signOut = async () => {
  await supabase.auth.signOut();
 };

 return (
  <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile }}>
   {children}
  </AuthContext.Provider>
 );
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
 return ctx;
}
