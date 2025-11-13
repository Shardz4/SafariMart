'use client';

import { Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { mockListings } from '../lib/mockData';

export default function PortfolioGrid() {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();

  const userAssets = user && walletAddress ? mockListings.slice(0, 3) : [];

  if (!user || !walletAddress) {
    return (
      <div className="text-center py-20">
        <Wallet className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <p className="text-xl text-gray-400 mb-2">Connect your wallet to view portfolio</p>
        <p className="text-sm text-gray-500">Login and connect MetaMask to see your assets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Portfolio</h2>
        <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400">Wallet</p>
          <p className="font-mono text-sm">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {userAssets.map((asset) => (
          <div key={asset.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <img src={asset.image} alt={asset.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-bold mb-2">{asset.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{asset.location}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Current Value</p>
                  <p className="text-lg font-bold text-green-400">{asset.price} MATIC</p>
                </div>
                <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition text-sm">
                  Sell
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl p-6">
          <p className="text-sm text-purple-200">Total Assets</p>
          <p className="text-3xl font-bold mt-2">{userAssets.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-6">
          <p className="text-sm text-green-200">Portfolio Value</p>
          <p className="text-3xl font-bold mt-2">1.6 MATIC</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-6">
          <p className="text-sm text-blue-200">Total Earnings</p>
          <p className="text-3xl font-bold mt-2">0.24 MATIC</p>
        </div>
      </div>
    </div>
  );
}