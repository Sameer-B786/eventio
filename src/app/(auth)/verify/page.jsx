"use client";

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const usernameParam = searchParams.get('username') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, username: usernameParam }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Eventio</h2>
        <p className="text-gray-500 mt-2">Verify your email address</p>
      </div>
      
      {!success ? (
        <form autoComplete="off" className="space-y-6" onSubmit={handleVerify}>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
          
          <p className="text-sm text-gray-600 text-center">
            We&apos;ve sent a verification code to your email. Please enter it below to confirm your account.
          </p>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="mt-2">
              <Input 
                id="email" 
                name="email" 
                type="email" 
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!emailParam}
                className={emailParam ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="code">Verification Code</Label>
            <div className="mt-2">
              <Input 
                id="code" 
                name="code" 
                type="text" 
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                required 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center tracking-widest text-lg"
                maxLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5" disabled={isLoading || code.length < 6}>
            {isLoading ? "Verifying..." : "Verify Account"}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-center">
          <div className="p-8 bg-green-50 text-green-700 rounded-2xl border border-green-100">
            <h3 className="text-2xl font-bold mb-2">Welcome aboard, {usernameParam}! 🎉</h3>
            <p className="text-sm font-medium">
              Your Eventio account has been successfully verified. <br />
              Redirecting you to login...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
