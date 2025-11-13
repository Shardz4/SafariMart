'use client';

import Link from 'next/link';
import { Home, ShoppingBag, Package, LayoutGrid } from 'lucide-react';
import AccountDropdown from './AccountDropdown';

export default function Header() {
  const tabs = [
    { id: '/', name: 'Home', icon: Home, href: '/' },
    { id: '/market', name: 'Market', icon: ShoppingBag, href: '/market' },
    { id: '/sell', name: 'Sell', icon: Package, href: '/sell' },
    { id: '/portfolio', name: 'Portfolio', icon: LayoutGrid, href: '/portfolio' },
  ];

  return (
    <header className="bg-gray-900 bg-opacity-50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">RWA Marketplace</h1>
              <p className="text-xs text-gray-400">African Assets on Blockchain</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition font-semibold"
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </Link>
            ))}
          </nav>
          <AccountDropdown />
        </div>
      </div>
    </header>
  );
}