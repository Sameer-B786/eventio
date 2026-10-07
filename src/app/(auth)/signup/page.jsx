"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Sign up the user
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      const signupData = await signupRes.json();
      
      if (!signupRes.ok) {
        throw new Error(signupData.error || 'Sign up failed');
      }

      if (signupData.userConfirmed) {
        // Automatically try to log them in to redirect to dashboard
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (loginRes.ok) {
          router.push('/idgen');
          router.refresh();
        } else {
          router.push('/login?message=signup_success_please_login');
        }
      } else {
        // User needs to confirm email via OTP
        router.push(`/verify?email=${encodeURIComponent(email)}&username=${encodeURIComponent(signupData.username || username)}`);
      }
      
    } catch (err) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
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
          <p className="text-gray-500 mt-2">Create a new account</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSignUp}>
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
                pattern="^\S+$"
                title="Username cannot contain spaces"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl"
              />
            </div>
            {username && (
              <div className="mt-3 space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Username condition:</p>
                {[
                  { label: "No spaces", met: /^\S+$/.test(username) },
                ].map((c, i) => (
                  <div key={i} className="flex items-center text-xs">
                    {c.met ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-gray-300 mr-2 shrink-0" />
                    )}
                    <span className={c.met ? "text-emerald-700" : "text-gray-500"}>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="mt-2">
              <Input 
                id="email" 
                name="email" 
                type="email" 
                autoComplete="email"
                autoCorrect="off"
                spellCheck="false"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="mt-2">
              <Input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck="false"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            
            {password && (
              <div className="mt-3 space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                {[
                  { label: "At least 8 characters", met: password.length >= 8 },
                  { label: "One uppercase letter", met: /[A-Z]/.test(password) },
                  { label: "One lowercase letter", met: /[a-z]/.test(password) },
                  { label: "One number", met: /[0-9]/.test(password) },
                  { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
                ].map((c, i) => (
                  <div key={i} className="flex items-center text-xs">
                    {c.met ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-gray-300 mr-2 shrink-0" />
                    )}
                    <span className={c.met ? "text-emerald-700" : "text-gray-500"}>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-5" 
            disabled={
              isLoading || 
              (password.length > 0 && !(
                password.length >= 8 && 
                /[A-Z]/.test(password) && 
                /[a-z]/.test(password) && 
                /[0-9]/.test(password) && 
                /[^A-Za-z0-9]/.test(password)
              )) ||
              (username.length > 0 && /\s/.test(username))
            }
          >
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
