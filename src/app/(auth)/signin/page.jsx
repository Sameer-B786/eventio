"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    
    try {
      const signInPromise = signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 10000)
      );

      const result = await Promise.race([signInPromise, timeoutPromise]);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // NextAuth handles the session cookie, just force navigate
        window.location.href = '/idgen';
      }
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        setError('Request timed out. The server took too long to respond.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center flex flex-col items-center">
          <div className="bg-gray-100 p-3 rounded-2xl mb-4 text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Eventio</h2>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-2xl text-center">{error}</div>}
          
          <div>
            <Label htmlFor="username">Username</Label>
            <div className="mt-2">
              <Input 
                id="username" 
                name="username" 
                type="text" 
                autoComplete="username"
                autoCorrect="off"
                spellCheck="false"
                required 
                title="Username cannot contain spaces"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">
                Forgot password?
              </Link>
            </div>
            <div className="mt-2">
              <Input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="current-password"
                autoCorrect="off"
                spellCheck="false"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-5" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
