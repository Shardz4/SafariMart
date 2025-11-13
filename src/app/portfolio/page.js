'use client';

import PortfolioGrid from '../../components/PortfolioGrid';
import Header from '../../components/Header';

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PortfolioGrid />
      </main>
    </>
  );
}