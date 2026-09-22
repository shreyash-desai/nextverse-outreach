import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a tiny network delay for UX
    await new Promise(r => setTimeout(r, 600));

    const success = login(username.trim(), password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-light flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-[420px] animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <span className="text-white font-bold text-xl">NV</span>
          </div>
          <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">Nextverse</h1>
          <p className="text-textSecondary mt-2">Sign in to the Outreach CRM</p>
        </div>

        <Card className="p-6 md:p-8 shadow-floating backdrop-blur-xl bg-surface/80 border-border/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}
            
            <Input
              label="Username"
              type="text"
              placeholder="Tejas@gonextverse"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-white/50"
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50"
            />

            <Button 
              type="submit" 
              className="w-full h-11 text-[15px] mt-2 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
