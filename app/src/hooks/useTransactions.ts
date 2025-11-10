import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

interface Transaction {
  signature: string;
  type: string;
  status: string;
  amount: string;
  token: string;
  timestamp: number;
}

export function useTransactions() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey || !connected) {
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const signatures = await connection.getSignaturesForAddress(
          publicKey,
          { limit: 10 }
        );

        const txs: Transaction[] = signatures.map((sig) => ({
          signature: sig.signature,
          type: 'swap',
          status: sig.err ? 'failed' : 'success',
          amount: '10',
          token: 'SOL',
          timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
        }));

        setTransactions(txs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchTransactions, 30000);

    return () => clearInterval(interval);
  }, [publicKey, connected, connection]);

  return { transactions, loading };
}
