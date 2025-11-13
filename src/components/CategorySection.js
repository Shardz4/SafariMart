'use client';

import { useState } from 'react';
import { LayoutGrid, Palette, Building2, Hammer } from 'lucide-react';
import MarketCard from './MarketCard';

export default function CategorySection({ listings }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Assets', icon: LayoutGrid },
    { id: 'art', name: 'Art', icon: Palette },
    { id: 'real-estate', name: 'Real Estate', icon: Building2 },
    { id: 'handicrafts', name: 'Handicrafts', icon: Hammer },
  ];

  const filteredListings = selectedCategory === 'all' ? listings : listings.filter((l) => l.category === selectedCategory);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                selectedCategory === cat.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredListings.map((listing) => (
          <MarketCard key={listing.id} listing={listing} />
        ))}
      </div>
      {filteredListings.length === 0 && (
        <div className="text-center py-20 col-span-full">
          <p className="text-xl text-gray-400">No assets found in this category</p>
        </div>
      )}
    </>
  );
}