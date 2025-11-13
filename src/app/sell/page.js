'use client';

import SellForm from '../../components/SellForm';
import Header from '../../components/Header';

export default function SellPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <SellForm />
      </main>
    </>
  );
}