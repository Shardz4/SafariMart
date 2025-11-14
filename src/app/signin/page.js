"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { user, loginWithEmail, signUpWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      setError('');
      setLoading(true);
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      // Note: router.push('/') is handled by useEffect when user state changes
    } catch (err) {
      const message = err?.message || 'Sign in failed';
      setError(message.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/, '').trim());
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleGoogle = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      // User state will be updated by AuthContext, and useEffect will redirect
    } catch (err) {
      const message = err?.message || 'Google sign-in failed';
      setError(message.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/, '').trim());
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-4">{isSignUp ? 'Create account' : 'Sign in'}</h1>
        {error && <div className="mb-4 text-sm text-red-300 bg-red-900 p-2 rounded">{error}</div>}
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          />
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </div>

        <div className="my-6 text-center text-sm text-gray-400">Or continue with</div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-semibold"
        >
          {loading ? 'Please wait...' : 'Sign in with Google'}
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-gray-400 hover:text-white">
            {isSignUp ? 'Switch to Sign in' : 'Need an account? Sign Up'}
          </button>
          <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
