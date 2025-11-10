import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SwapInterface } from '@/components/trading/SwapInterface';
import { useSwap } from '@/hooks/useSwap';

jest.mock('@/hooks/useSwap');
jest.mock('@/components/trading/TokenSelector', () => ({
  TokenSelector: ({ selectedToken, onSelectToken }: any) => (
    <button onClick={() => onSelectToken('USDC')}>
      {selectedToken}
    </button>
  ),
}));

describe('SwapInterface', () => {
  const mockExecuteSwap = jest.fn();
  const mockUseSwap = useSwap as jest.MockedFunction<typeof useSwap>;

  beforeEach(() => {
    mockUseSwap.mockReturnValue({
      executeSwap: mockExecuteSwap,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render swap interface', () => {
    render(<SwapInterface />);

    expect(screen.getByText('Swap')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('should render from and to token inputs', () => {
    render(<SwapInterface />);

    const inputs = screen.getAllByPlaceholderText('0.00');
    expect(inputs).toHaveLength(2);
  });

  it('should display settings button', () => {
    render(<SwapInterface />);

    const settingsButton = screen.getByRole('button', { name: '' });
    expect(settingsButton).toBeInTheDocument();
  });

  it('should toggle settings panel', () => {
    render(<SwapInterface />);

    const settingsButton = screen.getAllByRole('button')[0];
    fireEvent.click(settingsButton);

    expect(screen.getByText('Slippage Tolerance')).toBeInTheDocument();
  });

  it('should update from amount on input change', () => {
    render(<SwapInterface />);

    const [fromInput] = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(fromInput, { target: { value: '100' } });

    expect(fromInput).toHaveValue(100);
  });

  it('should update to amount on input change', () => {
    render(<SwapInterface />);

    const [, toInput] = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(toInput, { target: { value: '2000' } });

    expect(toInput).toHaveValue(2000);
  });

  it('should flip tokens when flip button is clicked', () => {
    render(<SwapInterface />);

    const [fromInput, toInput] = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(fromInput, { target: { value: '100' } });
    fireEvent.change(toInput, { target: { value: '2000' } });

    const flipButton = screen.getByRole('button', { name: '' });
    fireEvent.click(flipButton);

    expect(fromInput).toHaveValue(2000);
    expect(toInput).toHaveValue(100);
  });

  it('should change slippage value', () => {
    render(<SwapInterface />);

    const settingsButton = screen.getAllByRole('button')[0];
    fireEvent.click(settingsButton);

    const slippageButton = screen.getByText('0.5%');
    fireEvent.click(slippageButton);

    expect(slippageButton.className).toContain('bg-blue-600');
  });

  it('should display swap details when amounts are entered', () => {
    render(<SwapInterface />);

    const [fromInput, toInput] = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(fromInput, { target: { value: '100' } });
    fireEvent.change(toInput, { target: { value: '2000' } });

    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText('Price Impact')).toBeInTheDocument();
    expect(screen.getByText('Network Fee')).toBeInTheDocument();
    expect(screen.getByText('Minimum Received')).toBeInTheDocument();
  });

  it('should disable swap button when no amount', () => {
    render(<SwapInterface />);

    const swapButton = screen.getByRole('button', { name: 'Swap' });
    expect(swapButton).toBeDisabled();
  });

  it('should enable swap button when amount is entered', () => {
    render(<SwapInterface />);

    const [fromInput] = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(fromInput, { target: { value: '100' } });

    const swapButton = screen.getByRole('button', { name: 'Swap' });
    expect(swapButton).not.toBeDisabled();
  });

  it('should show loading state during swap', () => {
    mockUseSwap.mockReturnValue({
      executeSwap: mockExecuteSwap,
      loading: true,
      error: null,
    });

    render(<SwapInterface />);

    expect(screen.getByText('Swapping...')).toBeInTheDocument();
  });

  it('should display error message when swap fails', () => {
    mockUseSwap.mockReturnValue({
      executeSwap: mockExecuteSwap,
      loading: false,
      error: 'Insufficient balance',
    });

    render(<SwapInterface />);

    expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
  });

  it('should handle swap button click', async () => {
    render(<SwapInterface />);

    const [fromInput] = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(fromInput, { target: { value: '100' } });

    const swapButton = screen.getByRole('button', { name: 'Swap' });
    fireEvent.click(swapButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalled();
    });
  });

  it('should not call swap with invalid amount', () => {
    render(<SwapInterface />);

    const [fromInput] = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(fromInput, { target: { value: '0' } });

    const swapButton = screen.getByRole('button', { name: 'Swap' });
    fireEvent.click(swapButton);

    expect(mockExecuteSwap).not.toHaveBeenCalled();
  });

  it('should update custom slippage value', () => {
    render(<SwapInterface />);

    const settingsButton = screen.getAllByRole('button')[0];
    fireEvent.click(settingsButton);

    const customInput = screen.getByPlaceholderText('Custom');
    fireEvent.change(customInput, { target: { value: '2.5' } });

    expect(customInput).toHaveValue(2.5);
  });
});
