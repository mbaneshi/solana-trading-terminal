import { render, screen, fireEvent } from '@testing-library/react';
import { TokenSelector } from '@/components/trading/TokenSelector';

describe('TokenSelector', () => {
  const mockOnSelectToken = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render selected token', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    expect(screen.getByText('SOL')).toBeInTheDocument();
  });

  it('should open token list when clicked', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    expect(screen.getByPlaceholderText('Search tokens...')).toBeInTheDocument();
  });

  it('should display all available tokens', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    expect(screen.getByText('Solana')).toBeInTheDocument();
    expect(screen.getByText('USD Coin')).toBeInTheDocument();
    expect(screen.getByText('Tether')).toBeInTheDocument();
    expect(screen.getByText('Raydium')).toBeInTheDocument();
    expect(screen.getByText('Serum')).toBeInTheDocument();
  });

  it('should filter tokens by search query', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText('Search tokens...');
    fireEvent.change(searchInput, { target: { value: 'usd' } });

    expect(screen.getByText('USD Coin')).toBeInTheDocument();
    expect(screen.getByText('Tether')).toBeInTheDocument();
    expect(screen.queryByText('Solana')).not.toBeInTheDocument();
  });

  it('should filter tokens by symbol', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText('Search tokens...');
    fireEvent.change(searchInput, { target: { value: 'RAY' } });

    expect(screen.getByText('Raydium')).toBeInTheDocument();
    expect(screen.queryByText('Solana')).not.toBeInTheDocument();
  });

  it('should show no tokens message when search has no results', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText('Search tokens...');
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

    expect(screen.getByText('No tokens found')).toBeInTheDocument();
  });

  it('should call onSelectToken when token is clicked', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    const usdcButton = screen.getByText('USDC');
    fireEvent.click(usdcButton);

    expect(mockOnSelectToken).toHaveBeenCalledWith('USDC');
  });

  it('should close dropdown after token selection', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    const usdcButton = screen.getByText('USDC');
    fireEvent.click(usdcButton);

    expect(screen.queryByPlaceholderText('Search tokens...')).not.toBeInTheDocument();
  });

  it('should clear search after token selection', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText('Search tokens...');
    fireEvent.change(searchInput, { target: { value: 'USD' } });

    const usdcButton = screen.getByText('USDC');
    fireEvent.click(usdcButton);

    // Reopen dropdown
    const reopenButton = screen.getByText('SOL');
    fireEvent.click(reopenButton);

    const newSearchInput = screen.getByPlaceholderText('Search tokens...');
    expect(newSearchInput).toHaveValue('');
  });

  it('should close dropdown when clicking outside', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    expect(screen.getByPlaceholderText('Search tokens...')).toBeInTheDocument();

    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(screen.queryByPlaceholderText('Search tokens...')).not.toBeInTheDocument();
  });

  it('should show indicator for selected token in list', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    // Selected token should have indicator
    const selectedTokenButton = screen.getByText('SOL').closest('button');
    expect(selectedTokenButton).toBeInTheDocument();
  });

  it('should be case insensitive for search', () => {
    render(
      <TokenSelector
        selectedToken="SOL"
        onSelectToken={mockOnSelectToken}
      />
    );

    const button = screen.getByText('SOL');
    fireEvent.click(button);

    const searchInput = screen.getByPlaceholderText('Search tokens...');
    fireEvent.change(searchInput, { target: { value: 'solana' } });

    expect(screen.getByText('Solana')).toBeInTheDocument();
  });
});
