import { Server, Socket } from 'socket.io';
import { SolanaService } from './services/solana.service';
import { PriceService } from './services/price.service';
import { logger } from './utils/logger';

export function setupWebSocket(
  io: Server,
  solanaService: SolanaService,
  priceService: PriceService
) {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('subscribe:prices', async (tokens: string[]) => {
      logger.info(`Client ${socket.id} subscribed to prices for: ${tokens}`);

      // Send initial prices
      const prices = await priceService.getPrices(tokens);
      socket.emit('prices:update', prices);

      // Update prices every 5 seconds
      const interval = setInterval(async () => {
        const updatedPrices = await priceService.getPrices(tokens);
        socket.emit('prices:update', updatedPrices);
      }, 5000);

      // Store interval to clear on disconnect
      (socket.data as any).priceInterval = interval;
    });

    socket.on('subscribe:balance', async (walletAddress: string) => {
      logger.info(`Client ${socket.id} subscribed to balance for: ${walletAddress}`);

      try {
        // Send initial balance
        const balance = await solanaService.getBalance(walletAddress);
        const tokens = await solanaService.getTokenAccounts(walletAddress);
        socket.emit('balance:update', { balance, tokens });

        // Subscribe to account changes
        const subscriptionId = solanaService.subscribeToAccount(
          walletAddress,
          async () => {
            const updatedBalance = await solanaService.getBalance(walletAddress);
            const updatedTokens = await solanaService.getTokenAccounts(walletAddress);
            socket.emit('balance:update', {
              balance: updatedBalance,
              tokens: updatedTokens,
            });
          }
        );

        (socket.data as any).balanceSubscription = subscriptionId;
      } catch (error: any) {
        logger.error(`Error subscribing to balance: ${error.message}`);
        socket.emit('error', { message: 'Failed to subscribe to balance updates' });
      }
    });

    socket.on('unsubscribe:balance', () => {
      const subscriptionId = (socket.data as any).balanceSubscription;
      if (subscriptionId) {
        solanaService.unsubscribe(subscriptionId);
        delete (socket.data as any).balanceSubscription;
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);

      // Clear intervals
      if ((socket.data as any).priceInterval) {
        clearInterval((socket.data as any).priceInterval);
      }

      // Unsubscribe from account changes
      if ((socket.data as any).balanceSubscription) {
        solanaService.unsubscribe((socket.data as any).balanceSubscription);
      }
    });
  });
}
