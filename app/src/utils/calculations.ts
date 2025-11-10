export function calculateSwapOutput(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeNumerator: number = 3,
  feeDenominator: number = 1000
): number {
  if (reserveIn <= 0 || reserveOut <= 0 || amountIn <= 0) {
    return 0;
  }

  const amountInWithFee = amountIn * (feeDenominator - feeNumerator) / feeDenominator;
  return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
}

export function calculatePriceImpact(
  amountIn: number,
  reserveIn: number,
  reserveOut: number
): number {
  if (reserveIn <= 0 || reserveOut <= 0 || amountIn <= 0) {
    return 0;
  }

  const spotPrice = reserveOut / reserveIn;
  const amountOut = calculateSwapOutput(amountIn, reserveIn, reserveOut);
  const executionPrice = amountOut / amountIn;

  return ((spotPrice - executionPrice) / spotPrice) * 100;
}

export function calculateMinimumReceived(
  amountOut: number,
  slippagePercent: number
): number {
  return amountOut * (1 - slippagePercent / 100);
}

export function calculateLiquidityShare(
  lpTokenAmount: number,
  totalLpTokens: number
): number {
  if (totalLpTokens <= 0) return 0;
  return (lpTokenAmount / totalLpTokens) * 100;
}

export function calculateAPR(
  dailyVolume: number,
  totalLiquidity: number,
  feePercent: number = 0.3
): number {
  if (totalLiquidity <= 0) return 0;
  const dailyFees = dailyVolume * (feePercent / 100);
  const dailyReturn = dailyFees / totalLiquidity;
  return dailyReturn * 365 * 100;
}
