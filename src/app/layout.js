'use client';

import { AuthProvider } from '../context/AuthContext';
import { Web3Provider } from '../context/Web3Context';
import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <title>RWA Marketplace - African Assets on Blockchain</title>
        <meta name="description" content="Trade African real-world assets on the blockchain" />
      </head>
      <body className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white min-h-screen">
        <AuthProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </AuthProvider>
      </body>
    </html>
  );
}