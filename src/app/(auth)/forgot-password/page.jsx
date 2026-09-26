"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate reset request
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Eventio</h2>
          <p className="text-gray-500 mt-2">Reset your password</p>
        </div>
        
        {!isSubmitted ? (
          <form autoComplete="off" className="space-y-6" onSubmit={handleReset}>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
            
            <p className="text-sm text-gray-600 text-center">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="mt-2">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5" disabled={isLoading}>
              {isLoading ? "Sending link..." : "Send reset link"}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg">
              <h3 className="text-lg font-medium">Check your email</h3>
              <p className="mt-2 text-sm">
                We&apos;ve sent a password reset link to <span className="font-semibold">{email}</span>.
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
