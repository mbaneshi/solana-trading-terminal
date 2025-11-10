'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export function WalletConnectButton() {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey && (
        <div className="hidden sm:block text-sm bg-gray-800 rounded-lg px-4 py-2">
          <span className="text-gray-400">Connected: </span>
          <span className="font-mono text-white">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
      )}
      <WalletMultiButton />
    </div>
  );
}
