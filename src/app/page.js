'use client';

import CategorySection from '../components/CategorySection';
import { mockListings } from '../lib/mockData';
import Header from '../components/Header';
import { Sparkles, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full mb-4 border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Powered by Blockchain</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            African Assets on Blockchain
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Trade real-world assets from Africa. Art, real estate, and handicrafts tokenized for the world.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{mockListings.length}</p>
              <p className="text-gray-400 text-sm">Active Listings</p>
            </div>
            <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20">
              <Shield className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{mockListings.filter(l => l.verified).length}</p>
              <p className="text-gray-400 text-sm">Verified Assets</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">USDC</p>
              <p className="text-gray-400 text-sm">on Polygon</p>
            </div>
          </div>
        </div>

        {/* Marketplace Section */}
        <div className="space-y-6">
          <CategorySection listings={mockListings} />
        </div>
      </main>
    </>
  );
}