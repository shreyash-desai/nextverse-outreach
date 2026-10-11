import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'Admin' | 'Employee';
}

interface AuthContextType {
  user: string | null;
  role: string | null;
  authUser: AuthUser | null;
  session: Session | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to determine role from DB profile or founder fallback
function resolveUserRole(email: string, dbRole?: string | null): 'Admin' | 'Employee' {
  const normalized = email.toLowerCase().trim();
  if (normalized.startsWith('kishan@') || normalized.startsWith('shreyash@')) {
    return 'Admin';
  }
  return dbRole === 'Admin' ? 'Admin' : 'Employee';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('nextverse_user'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('nextverse_user_role') || 'Employee');
  const [isLoading, setIsLoading] = useState(true);

  // Sync role and user to DB using session or user table
  const fetchUserProfile = useCallback(async (sbUser: SupabaseUser | null, fallbackEmail?: string) => {
    const emailToLookup = sbUser?.email || fallbackEmail;
    if (!emailToLookup) {
      setAuthUser(null);
      setUser(null);
      setRole(null);
      localStorage.removeItem('nextverse_user');
      localStorage.removeItem('nextverse_user_role');
      return;
    }

    try {
      // 1. Try profiles table (if Supabase Auth migration applied)
      let resolvedRole: 'Admin' | 'Employee' = 'Employee';
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sbUser?.id || '')
        .maybeSingle();

      if (profile && profile.role) {
        resolvedRole = resolveUserRole(emailToLookup, profile.role);
      } else {
        // 2. Fallback to public.users table during transition
        const { data: dbUser } = await supabase
          .from('users')
          .select('role')
          .eq('username', emailToLookup)
          .maybeSingle();

        resolvedRole = resolveUserRole(emailToLookup, dbUser?.role);
      }

      const activeAuthUser: AuthUser = {
        id: sbUser?.id || emailToLookup,
        email: emailToLookup,
        username: emailToLookup.split('@')[0],
        role: resolvedRole
      };

      setAuthUser(activeAuthUser);
      setUser(emailToLookup);
      setRole(resolvedRole);
      localStorage.setItem('nextverse_user', emailToLookup);
      localStorage.setItem('nextverse_user_role', resolvedRole);
    } catch (err) {
      console.error('Error fetching user profile from database:', err);
      // Resilient fallback for offline / network transient errors
      const fallbackRole = resolveUserRole(emailToLookup, localStorage.getItem('nextverse_user_role'));
      setUser(emailToLookup);
      setRole(fallbackRole);
      setAuthUser({
        id: emailToLookup,
        email: emailToLookup,
        username: emailToLookup.split('@')[0],
        role: fallbackRole
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check active Supabase Auth session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      if (initialSession) {
        setSession(initialSession);
        fetchUserProfile(initialSession.user).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        // Check if user was previously signed in via transition credentials
        const savedUser = localStorage.getItem('nextverse_user');
        if (savedUser) {
          fetchUserProfile(null, savedUser).finally(() => {
            if (isMounted) setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      }
    });

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        await fetchUserProfile(newSession.user);
      } else if (!localStorage.getItem('nextverse_user')) {
        setAuthUser(null);
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    let email = usernameInput.trim();
    if (!email.includes('@')) {
      email = `${email}@gonextverse`;
    }

    try {
      // Step A: Attempt primary authentication via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });

      if (!authError && authData.session) {
        setSession(authData.session);
        await fetchUserProfile(authData.session.user);
        return { success: true };
      }

      // Step B: Graceful transition fallback to public.users table until migration SQL is executed
      const { data: legacyUser, error: legacyError } = await supabase
        .from('users')
        .select('*')
        .eq('username', email)
        .eq('password', passwordInput)
        .maybeSingle();

      if (legacyUser && !legacyError) {
        await fetchUserProfile(null, legacyUser.username);
        return { success: true };
      }

      return {
        success: false,
        error: authError?.message || 'Invalid username or password'
      };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    } finally {
      setSession(null);
      setAuthUser(null);
      setUser(null);
      setRole(null);
      localStorage.removeItem('nextverse_user');
      localStorage.removeItem('nextverse_user_role');
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user);
    } else if (user) {
      await fetchUserProfile(null, user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, authUser, session, login, logout, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
