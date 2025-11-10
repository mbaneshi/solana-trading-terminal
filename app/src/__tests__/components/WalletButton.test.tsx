import { render, screen } from '@testing-library/react';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

jest.mock('@solana/wallet-adapter-react');

describe('WalletConnectButton', () => {
  const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

  beforeEach(() => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      connecting: false,
      disconnecting: false,
      wallet: null,
      wallets: [],
      select: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTransaction: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      signMessage: jest.fn(),
      signIn: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render wallet button when not connected', () => {
    render(<WalletConnectButton />);

    const button = screen.getByText('Connect Wallet');
    expect(button).toBeInTheDocument();
  });

  it('should display connected address when wallet is connected', () => {
    const mockPublicKey = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

    mockUseWallet.mockReturnValue({
      publicKey: mockPublicKey,
      connected: true,
      connecting: false,
      disconnecting: false,
      wallet: null,
      wallets: [],
      select: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTransaction: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      signMessage: jest.fn(),
      signIn: jest.fn(),
    } as any);

    render(<WalletConnectButton />);

    expect(screen.getByText('Connected:')).toBeInTheDocument();
    expect(screen.getByText(/Fg6P...sLnS/)).toBeInTheDocument();
  });

  it('should format public key correctly', () => {
    const mockPublicKey = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

    mockUseWallet.mockReturnValue({
      publicKey: mockPublicKey,
      connected: true,
      connecting: false,
      disconnecting: false,
      wallet: null,
      wallets: [],
      select: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTransaction: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      signMessage: jest.fn(),
      signIn: jest.fn(),
    } as any);

    render(<WalletConnectButton />);

    const address = mockPublicKey.toBase58();
    const formattedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
    expect(screen.getByText(formattedAddress)).toBeInTheDocument();
  });

  it('should not render before component is mounted', () => {
    const { container } = render(<WalletConnectButton />);

    // Component should render after mount
    expect(container.firstChild).toBeTruthy();
  });

  it('should show wallet button in disconnected state', () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      connecting: false,
      disconnecting: false,
      wallet: null,
      wallets: [],
      select: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTransaction: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      signMessage: jest.fn(),
      signIn: jest.fn(),
    } as any);

    render(<WalletConnectButton />);

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should handle null public key gracefully', () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: true,
      connecting: false,
      disconnecting: false,
      wallet: null,
      wallets: [],
      select: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTransaction: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      signMessage: jest.fn(),
      signIn: jest.fn(),
    } as any);

    render(<WalletConnectButton />);

    expect(screen.queryByText('Connected:')).not.toBeInTheDocument();
  });
});
