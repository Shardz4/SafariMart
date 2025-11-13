'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function AccountDropdown() {
  const { user, loginWithEmail, signUpWithEmail, loginWithGoogle, logout } = useAuth();
  const { walletAddress, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowModal(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleAuth = async () => {
    try {
      setError('');
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      setShowModal(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/, '').trim());
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      setShowModal(false);
    } catch (err) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/, '').trim());
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      setIsOpen(false);
    } catch (err) {
      const errorMessage = err.message || 'Failed to connect wallet';
      alert(errorMessage);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          <User className="w-5 h-5" />
          <span className="hidden md:inline">{user ? user.displayName : 'Account'}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
            {!user ? (
              <div className="p-4">
                <button
                  onClick={() => { setShowModal(true); setIsOpen(false); }}
                  className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Login / Sign Up
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="pb-3 border-b border-gray-700">
                  <p className="text-sm text-gray-400">Logged in as</p>
                  <p className="font-semibold truncate">{user.email}</p>
                </div>
                {!walletAddress ? (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-400">Wallet Connected</p>
                      <p className="text-sm font-mono truncate">{walletAddress}</p>
                    </div>
                    <button
                      onClick={() => { disconnectWallet(); setIsOpen(false); }}
                      className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">{isSignUp ? 'Sign Up' : 'Login'}</h2>
            {error && <div className="bg-red-900 text-red-300 p-3 rounded mb-4">{error}</div>}
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
                placeholder="your@email.com"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
                placeholder="••••••••"
              />
              <button onClick={handleAuth} className="w-full px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold">
                {isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Google
            </button>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="flex-1 px-4 py-2 text-sm text-gray-400 hover:text-white transition"
              >
                {isSignUp ? 'Switch to Login' : 'Need an account? Sign Up'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}