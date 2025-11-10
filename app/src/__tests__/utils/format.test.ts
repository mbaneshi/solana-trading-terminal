import {
  formatNumber,
  formatTokenAmount,
  formatAddress,
  formatCurrency,
  formatPercentage,
  formatTimeAgo,
} from '@/utils/format';

describe('Format Utilities', () => {
  describe('formatNumber', () => {
    it('should format number with default decimals', () => {
      expect(formatNumber(123.456)).toBe('123.46');
      expect(formatNumber(123.454)).toBe('123.45');
    });

    it('should format number with custom decimals', () => {
      expect(formatNumber(123.456789, 4)).toBe('123.4568');
      expect(formatNumber(123.1, 0)).toBe('123');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-123.456)).toBe('-123.46');
    });
  });

  describe('formatTokenAmount', () => {
    it('should format token amount with 9 decimals', () => {
      expect(formatTokenAmount(1000000000)).toBe('1.0000');
      expect(formatTokenAmount(500000000)).toBe('0.5000');
    });

    it('should format token amount with custom decimals', () => {
      expect(formatTokenAmount(1000000, 6)).toBe('1.00');
    });

    it('should handle zero', () => {
      expect(formatTokenAmount(0)).toBe('0.0000');
    });
  });

  describe('formatAddress', () => {
    it('should format long address', () => {
      const address = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
      expect(formatAddress(address)).toBe('Fg6P...sLnS');
    });

    it('should format address with custom chars', () => {
      const address = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
      expect(formatAddress(address, 8, 8)).toBe('Fg6PaFpo...zPFsLnS');
    });

    it('should return full address if too short', () => {
      const address = 'short';
      expect(formatAddress(address)).toBe('short');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format custom currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(12.345)).toBe('12.35%');
    });

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(12.345, 1)).toBe('12.3%');
      expect(formatPercentage(12.345, 3)).toBe('12.345%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.00%');
    });

    it('should handle negative percentages', () => {
      expect(formatPercentage(-5.25)).toBe('-5.25%');
    });
  });

  describe('formatTimeAgo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format seconds ago', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 30;
      expect(formatTimeAgo(timestamp)).toBe('30s ago');
    });

    it('should format minutes ago', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 300;
      expect(formatTimeAgo(timestamp)).toBe('5m ago');
    });

    it('should format hours ago', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 7200;
      expect(formatTimeAgo(timestamp)).toBe('2h ago');
    });

    it('should format days ago', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 172800;
      expect(formatTimeAgo(timestamp)).toBe('2d ago');
    });

    it('should handle very recent timestamp', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 5;
      expect(formatTimeAgo(timestamp)).toBe('5s ago');
    });
  });
});
