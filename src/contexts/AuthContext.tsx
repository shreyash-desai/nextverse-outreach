import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

interface AuthContextType {
  user: string | null;
  role: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('nextverse_user');
    const savedRole = localStorage.getItem('nextverse_user_role');
    if (savedUser) {
      setUser(savedUser);
      setRole(savedRole || 'Employee');
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (data && !error) {
      setUser(data.username);
      setRole(data.role);
      localStorage.setItem('nextverse_user', data.username);
      localStorage.setItem('nextverse_user_role', data.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('nextverse_user');
    localStorage.removeItem('nextverse_user_role');
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
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
