import request from 'supertest';
import express, { Express } from 'express';
import { SolanaService } from '../../services/solana.service';
import { PriceService } from '../../services/price.service';

// Create a test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  const solanaService = new SolanaService();
  const priceService = new PriceService();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    });
  });

  // Balance endpoint
  app.get('/api/v1/wallet/balance/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await solanaService.getBalance(address);
      res.json({ balance });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Token accounts endpoint
  app.get('/api/v1/wallet/tokens/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const tokens = await solanaService.getTokenAccounts(address);
      res.json({ tokens });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Transactions endpoint
  app.get('/api/v1/transactions/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const transactions = await solanaService.getTransactionHistory(address, limit);
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Prices endpoint
  app.get('/api/v1/prices', async (req, res) => {
    try {
      const tokens = (req.query.tokens as string)?.split(',') || ['SOL'];
      const prices = await priceService.getPrices(tokens);
      res.json({ prices });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
};

jest.mock('../../services/solana.service');
jest.mock('../../services/price.service');

describe('API Controllers', () => {
  let app: Express;
  let mockSolanaService: jest.Mocked<SolanaService>;
  let mockPriceService: jest.Mocked<PriceService>;

  beforeEach(() => {
    mockSolanaService = new SolanaService() as jest.Mocked<SolanaService>;
    mockPriceService = new PriceService() as jest.Mocked<PriceService>;

    app = createTestApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });

    it('should return correct version', async () => {
      const response = await request(app).get('/health');

      expect(response.body.version).toBe('0.1.0');
    });

    it('should return ISO timestamp', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('GET /api/v1/wallet/balance/:address', () => {
    it('should return wallet balance', async () => {
      mockSolanaService.getBalance = jest.fn().mockResolvedValue(1.5);

      const response = await request(app)
        .get('/api/v1/wallet/balance/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('balance', 1.5);
    });

    it('should handle errors', async () => {
      mockSolanaService.getBalance = jest.fn().mockRejectedValue(
        new Error('Invalid address')
      );

      const response = await request(app)
        .get('/api/v1/wallet/balance/invalid');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should return zero balance for empty wallet', async () => {
      mockSolanaService.getBalance = jest.fn().mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/wallet/balance/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

      expect(response.status).toBe(200);
      expect(response.body.balance).toBe(0);
    });
  });

  describe('GET /api/v1/wallet/tokens/:address', () => {
    it('should return token accounts', async () => {
      const mockTokens = [
        { mint: 'TokenMint1', amount: 100, decimals: 9 },
        { mint: 'TokenMint2', amount: 50, decimals: 6 },
      ];

      mockSolanaService.getTokenAccounts = jest.fn().mockResolvedValue(mockTokens);

      const response = await request(app)
        .get('/api/v1/wallet/tokens/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

      expect(response.status).toBe(200);
      expect(response.body.tokens).toHaveLength(2);
      expect(response.body.tokens[0]).toMatchObject({
        mint: 'TokenMint1',
        amount: 100,
      });
    });

    it('should return empty array for wallet with no tokens', async () => {
      mockSolanaService.getTokenAccounts = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/wallet/tokens/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

      expect(response.status).toBe(200);
      expect(response.body.tokens).toHaveLength(0);
    });

    it('should handle errors', async () => {
      mockSolanaService.getTokenAccounts = jest.fn().mockRejectedValue(
        new Error('RPC error')
      );

      const response = await request(app)
        .get('/api/v1/wallet/tokens/invalid');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/transactions/:address', () => {
    it('should return transaction history', async () => {
      const mockTransactions = [
        {
          signature: 'sig1',
          blockTime: 1234567890,
          slot: 12345,
          err: null,
        },
      ];

      mockSolanaService.getTransactionHistory = jest.fn().mockResolvedValue(
        mockTransactions
      );

      const response = await request(app)
        .get('/api/v1/transactions/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(1);
    });

    it('should respect limit parameter', async () => {
      mockSolanaService.getTransactionHistory = jest.fn().mockResolvedValue([]);

      await request(app)
        .get('/api/v1/transactions/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
        .query({ limit: 10 });

      expect(mockSolanaService.getTransactionHistory).toHaveBeenCalledWith(
        expect.any(String),
        10
      );
    });

    it('should use default limit of 20', async () => {
      mockSolanaService.getTransactionHistory = jest.fn().mockResolvedValue([]);

      await request(app)
        .get('/api/v1/transactions/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

      expect(mockSolanaService.getTransactionHistory).toHaveBeenCalledWith(
        expect.any(String),
        20
      );
    });

    it('should handle errors', async () => {
      mockSolanaService.getTransactionHistory = jest.fn().mockRejectedValue(
        new Error('Network error')
      );

      const response = await request(app)
        .get('/api/v1/transactions/invalid');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/prices', () => {
    it('should return prices for requested tokens', async () => {
      mockPriceService.getPrices = jest.fn().mockResolvedValue({
        SOL: 100.0,
        USDC: 1.0,
      });

      const response = await request(app)
        .get('/api/v1/prices')
        .query({ tokens: 'SOL,USDC' });

      expect(response.status).toBe(200);
      expect(response.body.prices).toHaveProperty('SOL', 100.0);
      expect(response.body.prices).toHaveProperty('USDC', 1.0);
    });

    it('should default to SOL if no tokens specified', async () => {
      mockPriceService.getPrices = jest.fn().mockResolvedValue({
        SOL: 100.0,
      });

      await request(app).get('/api/v1/prices');

      expect(mockPriceService.getPrices).toHaveBeenCalledWith(['SOL']);
    });

    it('should handle single token', async () => {
      mockPriceService.getPrices = jest.fn().mockResolvedValue({
        USDC: 1.0,
      });

      const response = await request(app)
        .get('/api/v1/prices')
        .query({ tokens: 'USDC' });

      expect(response.status).toBe(200);
      expect(response.body.prices).toHaveProperty('USDC');
    });

    it('should handle multiple tokens', async () => {
      mockPriceService.getPrices = jest.fn().mockResolvedValue({
        SOL: 100.0,
        USDC: 1.0,
        USDT: 1.0,
      });

      const response = await request(app)
        .get('/api/v1/prices')
        .query({ tokens: 'SOL,USDC,USDT' });

      expect(response.status).toBe(200);
      expect(Object.keys(response.body.prices)).toHaveLength(3);
    });

    it('should handle errors', async () => {
      mockPriceService.getPrices = jest.fn().mockRejectedValue(
        new Error('Price feed error')
      );

      const response = await request(app).get('/api/v1/prices');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
