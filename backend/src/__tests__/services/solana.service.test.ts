import { SolanaService } from '../../services/solana.service';
import { Connection, PublicKey } from '@solana/web3.js';

jest.mock('@solana/web3.js');

describe('SolanaService', () => {
  let solanaService: SolanaService;
  let mockConnection: jest.Mocked<Connection>;

  beforeEach(() => {
    mockConnection = {
      getBalance: jest.fn(),
      getParsedTokenAccountsByOwner: jest.fn(),
      getSignaturesForAddress: jest.fn(),
      getParsedTransaction: jest.fn(),
      confirmTransaction: jest.fn(),
      onAccountChange: jest.fn(),
      removeAccountChangeListener: jest.fn(),
    } as any;

    (Connection as jest.MockedClass<typeof Connection>).mockImplementation(
      () => mockConnection
    );

    solanaService = new SolanaService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return balance in SOL', async () => {
      mockConnection.getBalance.mockResolvedValue(1000000000); // 1 SOL

      const balance = await solanaService.getBalance(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(balance).toBe(1);
      expect(mockConnection.getBalance).toHaveBeenCalled();
    });

    it('should handle zero balance', async () => {
      mockConnection.getBalance.mockResolvedValue(0);

      const balance = await solanaService.getBalance(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(balance).toBe(0);
    });

    it('should throw error for invalid address', async () => {
      mockConnection.getBalance.mockRejectedValue(
        new Error('Invalid public key')
      );

      await expect(
        solanaService.getBalance('invalid-address')
      ).rejects.toThrow('Invalid public key');
    });

    it('should convert lamports to SOL correctly', async () => {
      mockConnection.getBalance.mockResolvedValue(500000000); // 0.5 SOL

      const balance = await solanaService.getBalance(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(balance).toBe(0.5);
    });
  });

  describe('getTokenAccounts', () => {
    it('should return token accounts', async () => {
      const mockTokenAccounts = {
        value: [
          {
            account: {
              data: {
                parsed: {
                  info: {
                    mint: 'TokenMint123',
                    tokenAmount: {
                      uiAmount: 100,
                      decimals: 9,
                    },
                  },
                },
              },
            },
          },
        ],
      };

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        mockTokenAccounts as any
      );

      const tokens = await solanaService.getTokenAccounts(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        mint: 'TokenMint123',
        amount: 100,
        decimals: 9,
      });
    });

    it('should return empty array when no token accounts', async () => {
      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue({
        value: [],
      } as any);

      const tokens = await solanaService.getTokenAccounts(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(tokens).toHaveLength(0);
    });

    it('should handle multiple token accounts', async () => {
      const mockTokenAccounts = {
        value: [
          {
            account: {
              data: {
                parsed: {
                  info: {
                    mint: 'TokenMint1',
                    tokenAmount: { uiAmount: 100, decimals: 9 },
                  },
                },
              },
            },
          },
          {
            account: {
              data: {
                parsed: {
                  info: {
                    mint: 'TokenMint2',
                    tokenAmount: { uiAmount: 50, decimals: 6 },
                  },
                },
              },
            },
          },
        ],
      };

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        mockTokenAccounts as any
      );

      const tokens = await solanaService.getTokenAccounts(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(tokens).toHaveLength(2);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history', async () => {
      const mockSignatures = [
        {
          signature: 'sig1',
          blockTime: 1234567890,
          slot: 12345,
          err: null,
          memo: null,
        },
      ];

      mockConnection.getSignaturesForAddress.mockResolvedValue(
        mockSignatures as any
      );
      mockConnection.getParsedTransaction.mockResolvedValue({} as any);

      const transactions = await solanaService.getTransactionHistory(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toMatchObject({
        signature: 'sig1',
        blockTime: 1234567890,
      });
    });

    it('should respect limit parameter', async () => {
      const mockSignatures = Array(30).fill({
        signature: 'sig',
        blockTime: 1234567890,
        slot: 12345,
        err: null,
        memo: null,
      });

      mockConnection.getSignaturesForAddress.mockResolvedValue(
        mockSignatures as any
      );
      mockConnection.getParsedTransaction.mockResolvedValue({} as any);

      await solanaService.getTransactionHistory(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
        10
      );

      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledWith(
        expect.any(PublicKey),
        { limit: 10 }
      );
    });

    it('should use default limit of 20', async () => {
      mockConnection.getSignaturesForAddress.mockResolvedValue([]);

      await solanaService.getTransactionHistory(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(mockConnection.getSignaturesForAddress).toHaveBeenCalledWith(
        expect.any(PublicKey),
        { limit: 20 }
      );
    });

    it('should filter out null transactions', async () => {
      const mockSignatures = [
        { signature: 'sig1', blockTime: 1234567890, slot: 12345, err: null, memo: null },
        { signature: 'sig2', blockTime: 1234567891, slot: 12346, err: null, memo: null },
      ];

      mockConnection.getSignaturesForAddress.mockResolvedValue(
        mockSignatures as any
      );
      mockConnection.getParsedTransaction
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce(null);

      const transactions = await solanaService.getTransactionHistory(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      expect(transactions).toHaveLength(2);
    });
  });

  describe('confirmTransaction', () => {
    it('should return true for confirmed transaction', async () => {
      mockConnection.confirmTransaction.mockResolvedValue({
        value: { err: null },
      } as any);

      const confirmed = await solanaService.confirmTransaction('sig123');

      expect(confirmed).toBe(true);
    });

    it('should return false for failed transaction', async () => {
      mockConnection.confirmTransaction.mockResolvedValue({
        value: { err: new Error('Transaction failed') },
      } as any);

      const confirmed = await solanaService.confirmTransaction('sig123');

      expect(confirmed).toBe(false);
    });

    it('should return false on confirmation error', async () => {
      mockConnection.confirmTransaction.mockRejectedValue(
        new Error('Network error')
      );

      const confirmed = await solanaService.confirmTransaction('sig123');

      expect(confirmed).toBe(false);
    });
  });

  describe('subscribeToAccount', () => {
    it('should return subscription ID', () => {
      mockConnection.onAccountChange.mockReturnValue(123);

      const callback = jest.fn();
      const subscriptionId = solanaService.subscribeToAccount(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
        callback
      );

      expect(subscriptionId).toBe(123);
      expect(mockConnection.onAccountChange).toHaveBeenCalled();
    });

    it('should use confirmed commitment', () => {
      mockConnection.onAccountChange.mockReturnValue(123);

      const callback = jest.fn();
      solanaService.subscribeToAccount(
        'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
        callback
      );

      expect(mockConnection.onAccountChange).toHaveBeenCalledWith(
        expect.any(PublicKey),
        callback,
        'confirmed'
      );
    });
  });

  describe('unsubscribe', () => {
    it('should call removeAccountChangeListener', () => {
      solanaService.unsubscribe(123);

      expect(mockConnection.removeAccountChangeListener).toHaveBeenCalledWith(
        123
      );
    });
  });

  describe('getConnection', () => {
    it('should return connection instance', () => {
      const connection = solanaService.getConnection();

      expect(connection).toBe(mockConnection);
    });
  });
});
