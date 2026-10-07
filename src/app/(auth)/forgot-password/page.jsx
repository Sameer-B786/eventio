"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Request email, 2 = Verify code & new password, 3 = Success
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
      
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      setStep(3);
    } catch (err) {
      setError(err.message);
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
        
        {step === 1 && (
          <form autoComplete="off" className="space-y-6" onSubmit={handleRequestReset}>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
            
            <p className="text-sm text-gray-600 text-center">
              Enter your email address to receive a verification code to reset your password.
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
              {isLoading ? "Sending code..." : "Send Verification Code"}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form autoComplete="off" className="space-y-6" onSubmit={handleResetPassword}>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
            
            <p className="text-sm text-gray-600 text-center">
              We&apos;ve sent a verification code to <span className="font-semibold">{email}</span>.
            </p>

            <div>
              <Label htmlFor="code">Verification Code</Label>
              <div className="mt-2">
                <Input 
                  id="code" 
                  name="code" 
                  type="text" 
                  required 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="mt-2">
                <Input 
                  id="newPassword" 
                  name="newPassword" 
                  type="password" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <button type="button" onClick={() => setStep(1)} className="font-medium text-indigo-600 hover:text-indigo-500">
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg">
              <h3 className="text-lg font-medium">Password Reset Successful</h3>
              <p className="mt-2 text-sm">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              <Link href="/login" className="inline-flex w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-medium transition-colors">
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
