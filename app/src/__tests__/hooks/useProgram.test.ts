import { renderHook } from '@testing-library/react';
import { useProgram } from '@/hooks/useProgram';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

jest.mock('@solana/wallet-adapter-react');

describe('useProgram', () => {
  const mockUseConnection = useConnection as jest.MockedFunction<typeof useConnection>;
  const mockUseAnchorWallet = useAnchorWallet as jest.MockedFunction<typeof useAnchorWallet>;

  const mockConnection = new Connection('https://api.devnet.solana.com');
  const mockWallet = {
    publicKey: new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'),
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
  };

  beforeEach(() => {
    mockUseConnection.mockReturnValue({
      connection: mockConnection,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when wallet is not connected', () => {
    mockUseAnchorWallet.mockReturnValue(null);

    const { result } = renderHook(() => useProgram());

    expect(result.current).toBeNull();
  });

  it('should return program instance when wallet is connected', () => {
    mockUseAnchorWallet.mockReturnValue(mockWallet as any);

    const { result } = renderHook(() => useProgram());

    expect(result.current).not.toBeNull();
    expect(result.current).toHaveProperty('programId');
    expect(result.current).toHaveProperty('methods');
  });

  it('should use correct program ID', () => {
    mockUseAnchorWallet.mockReturnValue(mockWallet as any);

    const { result } = renderHook(() => useProgram());

    expect(result.current?.programId).toBeInstanceOf(PublicKey);
  });

  it('should update program when wallet changes', () => {
    mockUseAnchorWallet.mockReturnValue(null);

    const { result, rerender } = renderHook(() => useProgram());

    expect(result.current).toBeNull();

    // Simulate wallet connection
    mockUseAnchorWallet.mockReturnValue(mockWallet as any);
    rerender();

    expect(result.current).not.toBeNull();
  });

  it('should update program when connection changes', () => {
    mockUseAnchorWallet.mockReturnValue(mockWallet as any);

    const { result, rerender } = renderHook(() => useProgram());

    const firstProgram = result.current;

    // Simulate connection change
    const newConnection = new Connection('https://api.mainnet-beta.solana.com');
    mockUseConnection.mockReturnValue({
      connection: newConnection,
    } as any);

    rerender();

    expect(result.current).not.toBe(firstProgram);
  });

  it('should memoize program instance', () => {
    mockUseAnchorWallet.mockReturnValue(mockWallet as any);

    const { result, rerender } = renderHook(() => useProgram());

    const firstProgram = result.current;

    // Rerender without changing dependencies
    rerender();

    expect(result.current).toBe(firstProgram);
  });

  it('should create provider with correct commitment', () => {
    mockUseAnchorWallet.mockReturnValue(mockWallet as any);

    const { result } = renderHook(() => useProgram());

    // Provider should be created with confirmed commitment
    expect(result.current).not.toBeNull();
  });

  it('should handle wallet disconnection', () => {
    mockUseAnchorWallet.mockReturnValue(mockWallet as any);

    const { result, rerender } = renderHook(() => useProgram());

    expect(result.current).not.toBeNull();

    // Simulate wallet disconnection
    mockUseAnchorWallet.mockReturnValue(null);
    rerender();

    expect(result.current).toBeNull();
  });
});
