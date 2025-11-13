'use client';

import MarketCard from '../../components/MarketCard';
import CategorySection from '../../components/CategorySection';
import { mockListings } from '../../lib/mockData';
import Header from '../../components/Header';

export default function MarketPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <CategorySection listings={mockListings} />
        </div>
      </main>
    </>
  );
}