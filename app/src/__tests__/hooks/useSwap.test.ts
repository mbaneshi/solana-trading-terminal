import { renderHook, act, waitFor } from '@testing-library/react';
import { useSwap } from '@/hooks/useSwap';
import { useProgram } from '@/hooks/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

jest.mock('@/hooks/useProgram');
jest.mock('@solana/wallet-adapter-react');

describe('useSwap', () => {
  const mockExecute = jest.fn();
  const mockFetch = jest.fn();
  const mockUseProgram = useProgram as jest.MockedFunction<typeof useProgram>;
  const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

  const mockProgram = {
    methods: {
      swap: jest.fn(() => ({
        accounts: jest.fn(() => ({
          rpc: mockExecute,
        })),
      })),
    },
    account: {
      liquidityPool: {
        fetch: mockFetch,
      },
    },
    programId: new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'),
  };

  const mockPublicKey = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

  beforeEach(() => {
    mockUseProgram.mockReturnValue(mockProgram as any);
    mockUseWallet.mockReturnValue({
      publicKey: mockPublicKey,
      connected: true,
    } as any);

    mockFetch.mockResolvedValue({
      reserveA: { toNumber: () => 100000 },
      reserveB: { toNumber: () => 50000 },
      feeNumerator: { toNumber: () => 3 },
      feeDenominator: { toNumber: () => 1000 },
    });

    mockExecute.mockResolvedValue('tx-signature-123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSwap());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.executeSwap).toBeDefined();
  });

  it('should execute swap successfully', async () => {
    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    let txSignature: string;

    await act(async () => {
      txSignature = await result.current.executeSwap(
        tokenInMint,
        tokenOutMint,
        1000,
        1
      );
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(txSignature!).toBe('tx-signature-123');
    expect(result.current.error).toBe(null);
  });

  it('should set loading state during swap', async () => {
    mockExecute.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve('tx-signature-123'), 100))
    );

    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    act(() => {
      result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle swap error', async () => {
    mockExecute.mockRejectedValue(new Error('Insufficient funds'));

    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    await act(async () => {
      try {
        await result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1);
      } catch (error) {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Insufficient funds');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should throw error when wallet not connected', async () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
    } as any);

    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    await expect(
      result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1)
    ).rejects.toThrow('Wallet not connected');
  });

  it('should throw error when program not available', async () => {
    mockUseProgram.mockReturnValue(null);

    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    await expect(
      result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1)
    ).rejects.toThrow('Wallet not connected');
  });

  it('should calculate minimum amount out with slippage', async () => {
    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    await act(async () => {
      await result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1);
    });

    expect(mockProgram.methods.swap).toHaveBeenCalled();
    const swapCall = mockProgram.methods.swap.mock.calls[0];

    // Check that minimum amount out accounts for slippage
    expect(swapCall[1].toNumber()).toBeLessThan(swapCall[0].toNumber());
  });

  it('should fetch pool account before swap', async () => {
    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    await act(async () => {
      await result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1);
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('should clear error on new swap', async () => {
    mockExecute.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    // First swap - should fail
    await act(async () => {
      try {
        await result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1);
      } catch (error) {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('First error');
    });

    // Second swap - should clear error and succeed
    mockExecute.mockResolvedValueOnce('tx-signature-456');

    await act(async () => {
      await result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 1);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle different slippage values', async () => {
    const { result } = renderHook(() => useSwap());

    const tokenInMint = new PublicKey('So11111111111111111111111111111111111111112');
    const tokenOutMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    // Test with 5% slippage
    await act(async () => {
      await result.current.executeSwap(tokenInMint, tokenOutMint, 1000, 5);
    });

    expect(mockProgram.methods.swap).toHaveBeenCalled();
  });
});
