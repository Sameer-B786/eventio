"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // HONEYPOT FIELD: Invisible to humans. Bots will fill this out and we will reject them.
  const [website, setWebsite] = useState(''); 
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // If the honeypot is filled out, it's a bot!
    if (website !== '') {
      setError('Bot activity detected.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, honeypot: website }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      // Temporarily store email for autofill on login page
      sessionStorage.setItem('temp_email', email);
      window.location.href = '/login';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
        <p className="text-gray-500 mt-2">Get started with Eventio</p>
      </div>
      
      {error && <div className="p-3 mb-6 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-100">{error}</div>}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        {/* INVISIBLE HONEYPOT FIELD FOR BOTS */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label>Website</label>
          <input
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
