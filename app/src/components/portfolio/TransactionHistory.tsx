'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { History, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function TransactionHistory() {
  const { transactions, loading } = useTransactions();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'add_liquidity':
        return <ArrowDownLeft className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-24" />
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.signature}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ${getStatusColor(tx.status)}`}>
                {getTransactionIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold capitalize">
                    {tx.type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 truncate">
                  {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">
                  {tx.amount} {tx.token}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </div>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${tx.signature}${
                  process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : ''
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          ))
        )}
      </div>

      {transactions.length > 0 && (
        <button className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold py-2 transition-colors">
          View All Transactions
        </button>
      )}
    </div>
  );
}
