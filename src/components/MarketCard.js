'use client';

import { MapPin } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { ethers } from 'ethers';

export default function MarketCard({ listing }) {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();

  const handleBuy = async () => {
    if (!user) return alert('Please login first');
    if (!walletAddress) return alert('Please connect your wallet');
    // Production: Integrate contract call
    alert(`Purchasing ${listing.title} for ${listing.price} MATIC`);
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-700">
      <div className="relative">
        <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover" />
        {listing.verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            ✓ Verified
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 truncate">{listing.title}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{listing.description}</p>
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{listing.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Price</p>
            <p className="text-xl font-bold text-purple-400">{listing.price} MATIC</p>
          </div>
          <button
            onClick={handleBuy}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}