import axios from 'axios';
import { logger } from '../utils/logger';

interface PriceData {
  [token: string]: number;
}

export class PriceService {
  private priceCache: Map<string, { price: number; timestamp: number }>;
  private readonly CACHE_TTL = 10000; // 10 seconds

  constructor() {
    this.priceCache = new Map();
  }

  async getPrices(tokens: string[]): Promise<PriceData> {
    const prices: PriceData = {};
    const now = Date.now();

    for (const token of tokens) {
      // Check cache first
      const cached = this.priceCache.get(token);
      if (cached && now - cached.timestamp < this.CACHE_TTL) {
        prices[token] = cached.price;
        continue;
      }

      // Fetch new price
      try {
        const price = await this.fetchPrice(token);
        prices[token] = price;
        this.priceCache.set(token, { price, timestamp: now });
      } catch (error: any) {
        logger.error(`Error fetching price for ${token}: ${error.message}`);
        prices[token] = 0;
      }
    }

    return prices;
  }

  private async fetchPrice(token: string): Promise<number> {
    try {
      // Mock prices for demo - replace with actual price feed
      const mockPrices: { [key: string]: number } = {
        'SOL': 100.0,
        'USDC': 1.0,
        'USDT': 1.0,
        'RAY': 0.5,
        'SRM': 0.3,
      };

      if (mockPrices[token]) {
        return mockPrices[token];
      }

      // Fallback to CoinGecko API
      const coinIds: { [key: string]: string } = {
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'RAY': 'raydium',
        'SRM': 'serum',
      };

      const coinId = coinIds[token];
      if (!coinId) {
        return 0;
      }

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
          },
        }
      );

      return response.data[coinId]?.usd || 0;
    } catch (error: any) {
      logger.error(`Error in fetchPrice: ${error.message}`);
      return 0;
    }
  }

  async getHistoricalPrices(
    token: string,
    startTime: number,
    endTime: number
  ): Promise<Array<{ timestamp: number; price: number }>> {
    try {
      // Implementation for historical prices
      // This would typically query a time-series database or external API
      return [];
    } catch (error: any) {
      logger.error(`Error fetching historical prices: ${error.message}`);
      return [];
    }
  }
}
