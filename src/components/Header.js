'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, LayoutGrid, Zap } from 'lucide-react';
import AccountDropdown from './AccountDropdown';

export default function Header() {
  const pathname = usePathname();
  
  const tabs = [
    { id: '/', name: 'Home', icon: Home, href: '/' },
    { id: '/sell', name: 'Sell', icon: Package, href: '/sell' },
    { id: '/portfolio', name: 'Portfolio', icon: LayoutGrid, href: '/portfolio' },
  ];

  return (
    <header className="bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50 shadow-lg shadow-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">SafariMart</h1>
              <p className="text-xs text-gray-400">African Assets • Blockchain</p>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-semibold ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </nav>
          <AccountDropdown />
        </div>
      </div>
    </header>
  );
}