import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  price: number;
  value: number;
}

export function useBalance() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalances([]);
      setTotalValue(0);
      return;
    }

    const fetchBalances = async () => {
      setLoading(true);
      try {
        // Get SOL balance
        const solBalance = await connection.getBalance(publicKey);
        const solBalanceInSol = solBalance / 1e9;

        // Mock price for demo - replace with actual price feed
        const solPrice = 100;

        const mockBalances: TokenBalance[] = [
          {
            mint: 'So11111111111111111111111111111111111111112',
            symbol: 'SOL',
            balance: solBalanceInSol,
            price: solPrice,
            value: solBalanceInSol * solPrice,
          },
        ];

        // Get token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        // Add SPL tokens (with mock prices for demo)
        tokenAccounts.value.forEach((account) => {
          const tokenAmount = account.account.data.parsed.info.tokenAmount;
          const mint = account.account.data.parsed.info.mint;

          if (tokenAmount.uiAmount > 0) {
            mockBalances.push({
              mint,
              symbol: 'TOKEN',
              balance: tokenAmount.uiAmount,
              price: 1, // Mock price
              value: tokenAmount.uiAmount * 1,
            });
          }
        });

        const total = mockBalances.reduce((sum, token) => sum + token.value, 0);

        setBalances(mockBalances);
        setTotalValue(total);
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchBalances, 30000);

    return () => clearInterval(interval);
  }, [publicKey, connected, connection]);

  return { balances, totalValue, loading };
}
