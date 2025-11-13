'use client';

import { useEffect, useState } from 'react';
import MarketCard from '../../components/MarketCard';
import CategorySection from '../../components/CategorySection';
import Header from '../../components/Header';
import { getAllListings } from '../../lib/listings';

export default function MarketPage() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    setListings(getAllListings());
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <CategorySection listings={listings} />
        </div>
      </main>
    </>
  );
}