import { useCallback, useState } from 'react';
import { useProgram } from './useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

export function useSwap() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSwap = useCallback(
    async (
      tokenInMint: PublicKey,
      tokenOutMint: PublicKey,
      amountIn: number,
      slippage: number
    ) => {
      if (!program || !publicKey) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        // Get pool PDA
        const [poolPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('pool'),
            tokenInMint.toBuffer(),
            tokenOutMint.toBuffer(),
          ],
          program.programId
        );

        // Get user token accounts
        const userTokenIn = await getAssociatedTokenAddress(
          tokenInMint,
          publicKey
        );
        const userTokenOut = await getAssociatedTokenAddress(
          tokenOutMint,
          publicKey
        );

        // Get pool token accounts
        const poolTokenIn = await getAssociatedTokenAddress(
          tokenInMint,
          poolPda,
          true
        );
        const poolTokenOut = await getAssociatedTokenAddress(
          tokenOutMint,
          poolPda,
          true
        );

        // Fetch pool account to calculate output
        const poolAccount = await program.account.liquidityPool.fetch(poolPda);
        const amountOut = calculateSwapAmount(
          amountIn,
          poolAccount.reserveA.toNumber(),
          poolAccount.reserveB.toNumber(),
          poolAccount.feeNumerator.toNumber(),
          poolAccount.feeDenominator.toNumber()
        );

        const minimumAmountOut = Math.floor(amountOut * (1 - slippage / 100));

        // Execute swap
        const tx = await program.methods
          .swap(
            new anchor.BN(amountIn),
            new anchor.BN(minimumAmountOut)
          )
          .accounts({
            user: publicKey,
            pool: poolPda,
            userTokenIn,
            userTokenOut,
            poolTokenIn,
            poolTokenOut,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          })
          .rpc();

        console.log('Swap transaction signature:', tx);
        return tx;
      } catch (err: any) {
        console.error('Swap error:', err);
        setError(err.message || 'Swap failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, publicKey]
  );

  return { executeSwap, loading, error };
}

function calculateSwapAmount(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeNum: number,
  feeDenom: number
): number {
  const amountInWithFee = amountIn * (feeDenom - feeNum) / feeDenom;
  return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
}
