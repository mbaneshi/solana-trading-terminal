'use client';

import { useBalance } from '@/hooks/useBalance';
import { TrendingUp, Wallet } from 'lucide-react';

export function BalanceCard() {
  const { balances, totalValue, loading } = useBalance();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Portfolio</h2>
      </div>

      {/* Total Value */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">Total Value</div>
        <div className="text-3xl font-bold text-white mb-1">
          ${totalValue.toLocaleString()}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-400">+5.23%</span>
          <span className="text-gray-400">24h</span>
        </div>
      </div>

      {/* Token Balances */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-gray-400 mb-3">Assets</div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-20 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No tokens found</p>
            <p className="text-sm mt-1">Get started by acquiring some tokens</p>
          </div>
        ) : (
          balances.map((token) => (
            <div
              key={token.mint}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {token.symbol.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{token.symbol}</div>
                <div className="text-sm text-gray-400">
                  {token.balance.toFixed(4)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  ${token.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  ${token.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
