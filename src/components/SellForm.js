'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function SellForm() {
  const { user } = useAuth();
  const { walletAddress } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    category: 'art',
    price: '',
    location: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first');
    if (!walletAddress) return alert('Please connect your wallet');
    if (!formData.title || !formData.price || !formData.location || !formData.description) {
      return alert('Please fill all required fields');
    }
    // Production: Integrate contract call
    alert('Asset listed successfully!');
    setFormData({ title: '', category: 'art', price: '', location: '', description: '' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">List Your Asset</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Asset Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="e.g., Traditional Maasai Artwork"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              required
            >
              <option value="art">Art</option>
              <option value="real-estate">Real Estate</option>
              <option value="handicrafts">Handicrafts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Price (MATIC) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="0.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="e.g., Nairobi, Kenya"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 outline-none h-32 resize-none"
              placeholder="Describe your asset..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-4 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-bold text-lg"
          >
            List Asset
          </button>
        </form>
        {(!user || !walletAddress) && (
          <div className="mt-6 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ {!user ? 'Please login and connect your wallet to list assets.' : 'Please connect your wallet to list assets.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}