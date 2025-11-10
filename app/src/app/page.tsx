'use client';

import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { SwapInterface } from '@/components/trading/SwapInterface';
import { BalanceCard } from '@/components/portfolio/BalanceCard';
import { TransactionHistory } from '@/components/portfolio/TransactionHistory';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <h1 className="text-2xl font-bold text-white">Solana DEX</h1>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!connected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md space-y-6">
              <h2 className="text-4xl font-bold text-white">
                Welcome to Solana DEX
              </h2>
              <p className="text-lg text-gray-300">
                Trade tokens instantly with low fees on Solana blockchain
              </p>
              <div className="pt-4">
                <WalletConnectButton />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="rounded-lg bg-gray-800/50 p-4">
                  <div className="text-2xl font-bold text-blue-400">0.25%</div>
                  <div className="text-sm text-gray-400">Trading Fee</div>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-4">
                  <div className="text-2xl font-bold text-green-400">$2M+</div>
                  <div className="text-sm text-gray-400">Total Value Locked</div>
                </div>
                <div className="rounded-lg bg-gray-800/50 p-4">
                  <div className="text-2xl font-bold text-purple-400">10K+</div>
                  <div className="text-sm text-gray-400">Users</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Trading */}
            <div className="lg:col-span-2 space-y-6">
              <SwapInterface />
              <TransactionHistory />
            </div>

            {/* Right Column - Portfolio */}
            <div className="space-y-6">
              <BalanceCard />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>Solana DEX Trading Platform - Built with Anchor & Next.js</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
