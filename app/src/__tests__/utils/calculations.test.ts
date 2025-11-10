import {
  calculateSwapOutput,
  calculatePriceImpact,
  calculateMinimumReceived,
  calculateLiquidityShare,
  calculateAPR,
} from '@/utils/calculations';

describe('Calculation Utilities', () => {
  describe('calculateSwapOutput', () => {
    it('should calculate correct swap output with default fee', () => {
      const output = calculateSwapOutput(1000, 100000, 50000);
      expect(output).toBeGreaterThan(0);
      expect(output).toBeLessThan(500);
    });

    it('should calculate correct swap output with custom fee', () => {
      const output = calculateSwapOutput(1000, 100000, 50000, 5, 1000);
      expect(output).toBeGreaterThan(0);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateSwapOutput(0, 100000, 50000)).toBe(0);
      expect(calculateSwapOutput(1000, 0, 50000)).toBe(0);
      expect(calculateSwapOutput(1000, 100000, 0)).toBe(0);
      expect(calculateSwapOutput(-1000, 100000, 50000)).toBe(0);
    });

    it('should handle large amounts', () => {
      const output = calculateSwapOutput(1000000, 100000000, 50000000);
      expect(output).toBeGreaterThan(0);
      expect(output).toBeLessThan(500000);
    });

    it('should account for fees reducing output', () => {
      const outputNoFee = calculateSwapOutput(1000, 100000, 50000, 0, 1000);
      const outputWithFee = calculateSwapOutput(1000, 100000, 50000, 3, 1000);
      expect(outputWithFee).toBeLessThan(outputNoFee);
    });
  });

  describe('calculatePriceImpact', () => {
    it('should calculate positive price impact', () => {
      const impact = calculatePriceImpact(10000, 100000, 50000);
      expect(impact).toBeGreaterThan(0);
      expect(impact).toBeLessThan(100);
    });

    it('should calculate higher impact for larger trades', () => {
      const smallImpact = calculatePriceImpact(1000, 100000, 50000);
      const largeImpact = calculatePriceImpact(10000, 100000, 50000);
      expect(largeImpact).toBeGreaterThan(smallImpact);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculatePriceImpact(0, 100000, 50000)).toBe(0);
      expect(calculatePriceImpact(1000, 0, 50000)).toBe(0);
      expect(calculatePriceImpact(1000, 100000, 0)).toBe(0);
    });

    it('should handle very small trades', () => {
      const impact = calculatePriceImpact(1, 100000, 50000);
      expect(impact).toBeGreaterThan(0);
      expect(impact).toBeLessThan(1);
    });
  });

  describe('calculateMinimumReceived', () => {
    it('should calculate minimum with 1% slippage', () => {
      const minimum = calculateMinimumReceived(1000, 1);
      expect(minimum).toBe(990);
    });

    it('should calculate minimum with 0.5% slippage', () => {
      const minimum = calculateMinimumReceived(1000, 0.5);
      expect(minimum).toBe(995);
    });

    it('should calculate minimum with 5% slippage', () => {
      const minimum = calculateMinimumReceived(1000, 5);
      expect(minimum).toBe(950);
    });

    it('should handle zero amount', () => {
      const minimum = calculateMinimumReceived(0, 1);
      expect(minimum).toBe(0);
    });

    it('should handle decimal amounts', () => {
      const minimum = calculateMinimumReceived(123.456, 1);
      expect(minimum).toBeCloseTo(122.22144, 4);
    });
  });

  describe('calculateLiquidityShare', () => {
    it('should calculate correct share percentage', () => {
      const share = calculateLiquidityShare(100, 1000);
      expect(share).toBe(10);
    });

    it('should handle 50% share', () => {
      const share = calculateLiquidityShare(500, 1000);
      expect(share).toBe(50);
    });

    it('should handle 100% share', () => {
      const share = calculateLiquidityShare(1000, 1000);
      expect(share).toBe(100);
    });

    it('should return 0 for zero total', () => {
      const share = calculateLiquidityShare(100, 0);
      expect(share).toBe(0);
    });

    it('should handle small fractions', () => {
      const share = calculateLiquidityShare(1, 10000);
      expect(share).toBe(0.01);
    });
  });

  describe('calculateAPR', () => {
    it('should calculate APR with default fee', () => {
      const apr = calculateAPR(1000000, 10000000);
      expect(apr).toBeGreaterThan(0);
      expect(apr).toBeLessThan(100);
    });

    it('should calculate APR with custom fee', () => {
      const apr = calculateAPR(1000000, 10000000, 0.5);
      expect(apr).toBeGreaterThan(0);
    });

    it('should return 0 for zero liquidity', () => {
      const apr = calculateAPR(1000000, 0);
      expect(apr).toBe(0);
    });

    it('should calculate higher APR for higher volume', () => {
      const lowVolumeAPR = calculateAPR(100000, 10000000);
      const highVolumeAPR = calculateAPR(1000000, 10000000);
      expect(highVolumeAPR).toBeGreaterThan(lowVolumeAPR);
    });

    it('should calculate higher APR for lower liquidity', () => {
      const highLiquidityAPR = calculateAPR(1000000, 100000000);
      const lowLiquidityAPR = calculateAPR(1000000, 10000000);
      expect(lowLiquidityAPR).toBeGreaterThan(highLiquidityAPR);
    });

    it('should handle zero volume', () => {
      const apr = calculateAPR(0, 10000000);
      expect(apr).toBe(0);
    });
  });
});
