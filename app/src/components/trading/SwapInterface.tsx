'use client';

import { useState } from 'react';
import { useSwap } from '@/hooks/useSwap';
import { TokenSelector } from './TokenSelector';
import { ArrowDownUp, Settings } from 'lucide-react';

export function SwapInterface() {
  const { executeSwap, loading, error } = useSwap();
  const [fromToken, setFromToken] = useState<string>('SOL');
  const [toToken, setToToken] = useState<string>('USDC');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    try {
      // Execute swap logic
      console.log('Executing swap:', { fromToken, toToken, fromAmount, slippage });
      // await executeSwap(...);
    } catch (err) {
      console.error('Swap failed:', err);
    }
  };

  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Swap</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Slippage Tolerance
              </label>
              <div className="flex gap-2">
                {[0.1, 0.5, 1, 3].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      slippage === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  className="px-4 py-2 bg-gray-700 rounded-lg text-white w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSlippage(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="space-y-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-sm text-gray-400">Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl text-white outline-none"
            />
            <TokenSelector
              selectedToken={fromToken}
              onSelectToken={setFromToken}
            />
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleFlipTokens}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors border-4 border-gray-800"
          >
            <ArrowDownUp className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-sm text-gray-400">Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl text-white outline-none"
            />
            <TokenSelector
              selectedToken={toToken}
              onSelectToken={setToToken}
            />
          </div>
        </div>
      </div>

      {/* Swap Details */}
      {fromAmount && toAmount && (
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Rate</span>
            <span className="text-white">1 {fromToken} = 23.45 {toToken}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Price Impact</span>
            <span className="text-green-400">&lt;0.01%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Network Fee</span>
            <span className="text-white">~0.000005 SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Minimum Received</span>
            <span className="text-white">{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(4)} {toToken}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-4 rounded-lg transition-colors"
      >
        {loading ? 'Swapping...' : 'Swap'}
      </button>
    </div>
  );
}
