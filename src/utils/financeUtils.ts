/**
 * Financial Calculation & Rounding Utilities for Swiss Francs (CHF)
 */

/**
 * Rounds an amount in CHF to 2 decimal places (exact Rappen precision / 0.05 CHF step).
 */
export const roundCHF = (amount: number): number => {
  if (isNaN(amount)) return 0;
  // Round to nearest 0.05 CHF (5 Rappen)
  return Math.round(amount * 20) / 20;
};

/**
 * Standard rounding to 2 decimal places.
 */
export const roundTwoDecimals = (amount: number): number => {
  if (isNaN(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates 15% platform fee for GET A COACH.ch (rounded to 0.05 CHF)
 */
export const calculatePlatformCommission = (grossAmount: number): number => {
  return roundCHF(grossAmount * 0.15);
};

/**
 * Calculates 85% coach payout amount (rounded to 0.05 CHF)
 */
export const calculateCoachPayout = (grossAmount: number): number => {
  return roundCHF(grossAmount * 0.85);
};
