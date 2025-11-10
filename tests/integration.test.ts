import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TradingPlatform } from '../target/types/trading_platform';
import { expect } from 'chai';
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
} from '@solana/spl-token';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';

describe('Trading Platform Integration Tests', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TradingPlatform as Program<TradingPlatform>;

  let tokenAMint: PublicKey;
  let tokenBMint: PublicKey;
  let userTokenAAccount: PublicKey;
  let userTokenBAccount: PublicKey;
  let userLpTokenAccount: PublicKey;
  let poolPda: PublicKey;
  let poolBump: number;

  const authority = provider.wallet.publicKey;

  before(async () => {
    // Create Token A
    tokenAMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      authority,
      authority,
      9
    );

    // Create Token B
    tokenBMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      authority,
      authority,
      9
    );

    // Create user token accounts
    userTokenAAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      tokenAMint,
      authority
    );

    userTokenBAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      tokenBMint,
      authority
    );

    // Mint tokens to user
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      tokenAMint,
      userTokenAAccount,
      authority,
      10_000_000_000 // 10,000 tokens
    );

    await mintTo(
      provider.connection,
      provider.wallet.payer,
      tokenBMint,
      userTokenBAccount,
      authority,
      10_000_000_000 // 10,000 tokens
    );

    // Find pool PDA
    [poolPda, poolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), tokenAMint.toBuffer(), tokenBMint.toBuffer()],
      program.programId
    );
  });

  describe('Initialize Pool', () => {
    it('Successfully initializes a liquidity pool', async () => {
      const tokenAVault = Keypair.generate();
      const tokenBVault = Keypair.generate();
      const lpTokenMint = Keypair.generate();

      const feeNumerator = new anchor.BN(25); // 0.25%
      const feeDenominator = new anchor.BN(10000);

      await program.methods
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

      const poolAccount = await program.account.liquidityPool.fetch(poolPda);
      expect(poolAccount.tokenAMint.toString()).to.equal(tokenAMint.toString());
      expect(poolAccount.tokenBMint.toString()).to.equal(tokenBMint.toString());
      expect(poolAccount.feeNumerator.toNumber()).to.equal(25);
      expect(poolAccount.feeDenominator.toNumber()).to.equal(10000);
      expect(poolAccount.isPaused).to.be.false;
    });

    it('Fails to initialize pool with invalid fee', async () => {
      const invalidFeeNum = new anchor.BN(600); // 6% - too high
      const feeDenom = new anchor.BN(10000);

      try {
        await program.methods
          .initializePool(invalidFeeNum, feeDenom)
          .accounts({
            // ... accounts
          })
          .rpc();
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.error.errorCode.code).to.equal('InvalidFee');
      }
    });
  });

  describe('Add Liquidity', () => {
    it('Successfully adds initial liquidity', async () => {
      const poolAccount = await program.account.liquidityPool.fetch(poolPda);

      userLpTokenAccount = await getAssociatedTokenAddress(
        poolAccount.lpTokenMint,
        authority
      );

      const amountA = new anchor.BN(1_000_000_000); // 1000 tokens
      const amountB = new anchor.BN(1_000_000_000); // 1000 tokens
      const minLiquidity = new anchor.BN(0);

      await program.methods
        .addLiquidity(amountA, amountB, minLiquidity)
        .accounts({
          user: authority,
          pool: poolPda,
          userTokenA: userTokenAAccount,
          userTokenB: userTokenBAccount,
          userLpToken: userLpTokenAccount,
          poolTokenA: poolAccount.tokenAVault,
          poolTokenB: poolAccount.tokenBVault,
          lpTokenMint: poolAccount.lpTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const updatedPool = await program.account.liquidityPool.fetch(poolPda);
      expect(updatedPool.reserveA.toNumber()).to.equal(1_000_000_000);
      expect(updatedPool.reserveB.toNumber()).to.equal(1_000_000_000);
    });
  });

  describe('Swap', () => {
    it('Successfully executes a swap', async () => {
      const poolAccount = await program.account.liquidityPool.fetch(poolPda);

      const amountIn = new anchor.BN(10_000_000); // 10 tokens
      const minimumAmountOut = new anchor.BN(0);

      const userTokenABefore = await getAccount(
        provider.connection,
        userTokenAAccount
      );

      await program.methods
        .swap(amountIn, minimumAmountOut)
        .accounts({
          user: authority,
          pool: poolPda,
          userTokenIn: userTokenAAccount,
          userTokenOut: userTokenBAccount,
          poolTokenIn: poolAccount.tokenAVault,
          poolTokenOut: poolAccount.tokenBVault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const userTokenAAfter = await getAccount(
        provider.connection,
        userTokenAAccount
      );

      expect(userTokenAAfter.amount).to.be.lessThan(userTokenABefore.amount);
    });

    it('Fails when slippage exceeded', async () => {
      const poolAccount = await program.account.liquidityPool.fetch(poolPda);

      const amountIn = new anchor.BN(10_000_000);
      const minimumAmountOut = new anchor.BN(99_999_999_999); // Unrealistic

      try {
        await program.methods
          .swap(amountIn, minimumAmountOut)
          .accounts({
            user: authority,
            pool: poolPda,
            userTokenIn: userTokenAAccount,
            userTokenOut: userTokenBAccount,
            poolTokenIn: poolAccount.tokenAVault,
            poolTokenOut: poolAccount.tokenBVault,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.error.errorCode.code).to.equal('SlippageExceeded');
      }
    });
  });

  describe('Remove Liquidity', () => {
    it('Successfully removes liquidity', async () => {
      const poolAccount = await program.account.liquidityPool.fetch(poolPda);
      const lpTokenAccount = await getAccount(
        provider.connection,
        userLpTokenAccount
      );

      const liquidityAmount = new anchor.BN(lpTokenAccount.amount.toString()).div(new anchor.BN(2));
      const minAmountA = new anchor.BN(0);
      const minAmountB = new anchor.BN(0);

      await program.methods
        .removeLiquidity(liquidityAmount, minAmountA, minAmountB)
        .accounts({
          user: authority,
          pool: poolPda,
          userTokenA: userTokenAAccount,
          userTokenB: userTokenBAccount,
          userLpToken: userLpTokenAccount,
          poolTokenA: poolAccount.tokenAVault,
          poolTokenB: poolAccount.tokenBVault,
          lpTokenMint: poolAccount.lpTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const updatedLpTokenAccount = await getAccount(
        provider.connection,
        userLpTokenAccount
      );

      expect(updatedLpTokenAccount.amount).to.be.lessThan(lpTokenAccount.amount);
    });
  });
});
