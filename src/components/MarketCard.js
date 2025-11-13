'use client';

import { MapPin, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { ethers } from 'ethers';
import { useState } from 'react';
import { getUSDCContract, getRWAMarketplaceContract, RWA_MARKETPLACE_ADDRESS, USDC_ADDRESS } from '../lib/contracts';
import { getSavedListings, saveListings } from '../lib/listings';

export default function MarketCard({ listing }) {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuy = async () => {
    if (!user) return alert('Please login first');
    if (!walletAddress) return alert('Please connect your wallet');
    
    setIsProcessing(true);
    try {
      // If marketplace address isn't configured or there's no wallet provider, fallback to local purchase
      if (!RWA_MARKETPLACE_ADDRESS || typeof window === 'undefined' || !window.ethereum) {
        // Simulate purchase: remove from saved listings if it exists there
        const saved = getSavedListings();
        const remaining = saved.filter((l) => String(l.id) !== String(listing.id));
        saveListings(remaining);
        alert(`Purchased ${listing.title} (local simulation).`);
        return;
      }

      // On-chain flow
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Use USDC contract to check allowance and approve if needed
      const usdc = getUSDCContract(signer);
      const marketplace = getRWAMarketplaceContract(signer);

      if (!usdc || !marketplace) {
        throw new Error('USDC or marketplace contract not configured');
      }

      const decimals = await usdc.decimals().catch(() => 6);
      const priceAmount = ethers.parseUnits(String(listing.price), decimals);

      const ownerAddress = await signer.getAddress();

      // Check allowance
      const allowance = await usdc.allowance(ownerAddress, RWA_MARKETPLACE_ADDRESS);
      if (allowance < priceAmount) {
        const approveTx = await usdc.approve(RWA_MARKETPLACE_ADDRESS, priceAmount);
        await approveTx.wait();
      }

      // Call marketplace buyAsset. We assume listing.id maps to on-chain listingId for on-chain listings.
      const tx = await marketplace.buyAsset(listing.id);
      await tx.wait();
      alert('Purchase successful on-chain');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {listing.verified && (
          <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 truncate text-white group-hover:text-purple-400 transition-colors">{listing.title}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{listing.description}</p>
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <MapPin className="w-4 h-4 mr-1 text-purple-400" />
          <span>{listing.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">${listing.price}</p>
            <p className="text-xs text-gray-500">USDC</p>
          </div>
          <button
            onClick={handleBuy}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}