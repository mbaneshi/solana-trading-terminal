import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { SolanaService } from './services/solana.service';
import { PriceService } from './services/price.service';
import { setupWebSocket } from './websocket';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Services
const solanaService = new SolanaService();
const priceService = new PriceService();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// API Routes
app.get('/api/v1/wallet/balance/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const balance = await solanaService.getBalance(address);
    res.json({ balance });
  } catch (error: any) {
    logger.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/wallet/tokens/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const tokens = await solanaService.getTokenAccounts(address);
    res.json({ tokens });
  } catch (error: any) {
    logger.error('Error fetching tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/transactions/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const transactions = await solanaService.getTransactionHistory(address, limit);
    res.json({ transactions });
  } catch (error: any) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/prices', async (req: Request, res: Response) => {
  try {
    const tokens = (req.query.tokens as string)?.split(',') || ['SOL'];
    const prices = await priceService.getPrices(tokens);
    res.json({ prices });
  } catch (error: any) {
    logger.error('Error fetching prices:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket setup
setupWebSocket(io, solanaService, priceService);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`WebSocket enabled`);
});

export { app, httpServer, io };
