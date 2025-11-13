'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { walletAddress } = useWeb3();

  useEffect(() => {
    if (user && walletAddress) {
      router.push('/market');
    } else if (user) {
      router.push('/market');
    } else {
      router.push('/market');
    }
  }, [user, walletAddress, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">RWA Marketplace</h1>
        <p className="text-xl text-gray-400">African Assets on Blockchain</p>
        <p className="mt-4 text-gray-500">Redirecting to Market...</p>
      </div>
    </div>
  );
}