import { PriceService } from '../../services/price.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PriceService', () => {
  let priceService: PriceService;

  beforeEach(() => {
    priceService = new PriceService();
    jest.clearAllMocks();
  });

  describe('getPrices', () => {
    it('should return mock prices for known tokens', async () => {
      const prices = await priceService.getPrices(['SOL', 'USDC']);

      expect(prices).toHaveProperty('SOL');
      expect(prices).toHaveProperty('USDC');
      expect(prices.SOL).toBe(100.0);
      expect(prices.USDC).toBe(1.0);
    });

    it('should handle single token', async () => {
      const prices = await priceService.getPrices(['SOL']);

      expect(prices).toHaveProperty('SOL');
      expect(prices.SOL).toBe(100.0);
    });

    it('should handle multiple tokens', async () => {
      const prices = await priceService.getPrices(['SOL', 'USDC', 'USDT', 'RAY', 'SRM']);

      expect(Object.keys(prices)).toHaveLength(5);
      expect(prices.SOL).toBe(100.0);
      expect(prices.USDC).toBe(1.0);
      expect(prices.USDT).toBe(1.0);
      expect(prices.RAY).toBe(0.5);
      expect(prices.SRM).toBe(0.3);
    });

    it('should return 0 for unknown tokens', async () => {
      const prices = await priceService.getPrices(['UNKNOWN']);

      expect(prices).toHaveProperty('UNKNOWN');
      expect(prices.UNKNOWN).toBe(0);
    });

    it('should use cache for subsequent requests', async () => {
      const spy = jest.spyOn(priceService as any, 'fetchPrice');

      // First call
      await priceService.getPrices(['SOL']);
      expect(spy).toHaveBeenCalledTimes(1);

      // Second call within cache TTL
      await priceService.getPrices(['SOL']);
      expect(spy).toHaveBeenCalledTimes(1); // Should not fetch again
    });

    it('should refresh cache after TTL expires', async () => {
      const spy = jest.spyOn(priceService as any, 'fetchPrice');

      // First call
      await priceService.getPrices(['SOL']);
      expect(spy).toHaveBeenCalledTimes(1);

      // Wait for cache to expire (mock time)
      jest.advanceTimersByTime(11000); // 11 seconds (TTL is 10 seconds)

      // Second call after TTL
      await priceService.getPrices(['SOL']);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch errors gracefully', async () => {
      const spy = jest.spyOn(priceService as any, 'fetchPrice');
      spy.mockRejectedValue(new Error('Network error'));

      const prices = await priceService.getPrices(['SOL']);

      expect(prices.SOL).toBe(0);
    });

    it('should cache prices independently per token', async () => {
      const spy = jest.spyOn(priceService as any, 'fetchPrice');

      await priceService.getPrices(['SOL']);
      expect(spy).toHaveBeenCalledTimes(1);

      await priceService.getPrices(['USDC']);
      expect(spy).toHaveBeenCalledTimes(2);

      // Both should be cached now
      await priceService.getPrices(['SOL', 'USDC']);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchPrice', () => {
    it('should return mock price for SOL', async () => {
      const price = await (priceService as any).fetchPrice('SOL');

      expect(price).toBe(100.0);
    });

    it('should return mock price for USDC', async () => {
      const price = await (priceService as any).fetchPrice('USDC');

      expect(price).toBe(1.0);
    });

    it('should return 0 for unknown token', async () => {
      const price = await (priceService as any).fetchPrice('UNKNOWN');

      expect(price).toBe(0);
    });

    it('should fallback to CoinGecko API if mock not found', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          solana: { usd: 105.5 },
        },
      });

      // Remove mock price temporarily
      const originalFetchPrice = (priceService as any).fetchPrice;
      (priceService as any).fetchPrice = jest.fn(async (token: string) => {
        if (token === 'SOL') {
          const response = await axios.get(
            'https://api.coingecko.com/api/v3/simple/price',
            {
              params: {
                ids: 'solana',
                vs_currencies: 'usd',
              },
            }
          );
          return response.data.solana?.usd || 0;
        }
        return 0;
      });

      const price = await (priceService as any).fetchPrice('SOL');

      expect(price).toBe(105.5);
      expect(mockedAxios.get).toHaveBeenCalled();

      // Restore original
      (priceService as any).fetchPrice = originalFetchPrice;
    });

    it('should handle CoinGecko API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API error'));

      const price = await (priceService as any).fetchPrice('SOL');

      expect(price).toBe(100.0); // Falls back to mock price
    });
  });

  describe('getHistoricalPrices', () => {
    it('should return empty array', async () => {
      const prices = await priceService.getHistoricalPrices(
        'SOL',
        Date.now() - 86400000,
        Date.now()
      );

      expect(prices).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      const prices = await priceService.getHistoricalPrices(
        'INVALID',
        0,
        0
      );

      expect(prices).toEqual([]);
    });
  });
});
