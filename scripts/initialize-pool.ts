import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TradingPlatform } from '../target/types/trading_platform';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';

async function initializePool() {
  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TradingPlatform as Program<TradingPlatform>;
  const authority = provider.wallet.publicKey;

  console.log('Initializing pool...');
  console.log('Authority:', authority.toString());

  // Create test tokens (or use existing mints)
  console.log('\nCreating Token A...');
  const tokenAMint = await createMint(
    provider.connection,
    provider.wallet.payer,
    authority,
    authority,
    9 // decimals
  );
  console.log('Token A Mint:', tokenAMint.toString());

  console.log('\nCreating Token B...');
  const tokenBMint = await createMint(
    provider.connection,
    provider.wallet.payer,
    authority,
    authority,
    9 // decimals
  );
  console.log('Token B Mint:', tokenBMint.toString());

  // Generate PDAs
  const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), tokenAMint.toBuffer(), tokenBMint.toBuffer()],
    program.programId
  );

  console.log('\nPool PDA:', poolPda.toString());

  // Create token accounts
  const tokenAVault = Keypair.generate();
  const tokenBVault = Keypair.generate();
  const lpTokenMint = Keypair.generate();

  console.log('\nInitializing pool...');
  const feeNumerator = new anchor.BN(25); // 0.25%
  const feeDenominator = new anchor.BN(10000);

  try {
    const tx = await program.methods
      .initializePool(feeNumerator, feeDenominator)
      .accounts({
        authority: authority,
        pool: poolPda,
        tokenAMint: tokenAMint,
        tokenBMint: tokenBMint,
        tokenAVault: tokenAVault.publicKey,
        tokenBVault: tokenBVault.publicKey,
        lpTokenMint: lpTokenMint.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([tokenAVault, tokenBVault, lpTokenMint])
      .rpc();

    console.log('\n✅ Pool initialized successfully!');
    console.log('Transaction signature:', tx);
    console.log('\nPool Details:');
    console.log('  Pool Address:', poolPda.toString());
    console.log('  Token A Mint:', tokenAMint.toString());
    console.log('  Token B Mint:', tokenBMint.toString());
    console.log('  Token A Vault:', tokenAVault.publicKey.toString());
    console.log('  Token B Vault:', tokenBVault.publicKey.toString());
    console.log('  LP Token Mint:', lpTokenMint.publicKey.toString());
    console.log('  Fee:', `${feeNumerator.toNumber() / feeDenominator.toNumber() * 100}%`);

    // Optionally add initial liquidity
    console.log('\n📝 To add liquidity, use the add-liquidity script');
    console.log('   or use the frontend interface');

  } catch (error) {
    console.error('\n❌ Error initializing pool:', error);
    throw error;
  }
}

initializePool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
