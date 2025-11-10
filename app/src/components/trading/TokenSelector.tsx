'use client';

import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const TOKENS = [
  { symbol: 'SOL', name: 'Solana', logo: '◎' },
  { symbol: 'USDC', name: 'USD Coin', logo: '💵' },
  { symbol: 'USDT', name: 'Tether', logo: '₮' },
  { symbol: 'RAY', name: 'Raydium', logo: '⚡' },
  { symbol: 'SRM', name: 'Serum', logo: '🔷' },
];

interface TokenSelectorProps {
  selectedToken: string;
  onSelectToken: (token: string) => void;
}

export function TokenSelector({ selectedToken, onSelectToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedTokenData = TOKENS.find(t => t.symbol === selectedToken);
  const filteredTokens = TOKENS.filter(token =>
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
      >
        <span className="text-xl">{selectedTokenData?.logo}</span>
        <span className="text-white font-semibold">{selectedToken}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50">
            <div className="p-3 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onSelectToken(token.symbol);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors"
                >
                  <span className="text-2xl">{token.logo}</span>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                  </div>
                  {token.symbol === selectedToken && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
              {filteredTokens.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  No tokens found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
