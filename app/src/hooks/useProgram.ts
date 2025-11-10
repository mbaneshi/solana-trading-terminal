import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import idl from '../idl/trading_platform.json';
import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });

    return new Program(idl as Idl, new PublicKey(PROGRAM_ID), provider);
  }, [connection, wallet]);

  return program;
}
