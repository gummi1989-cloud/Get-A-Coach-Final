/**
 * Financial Calculation & Rounding Utilities for Swiss Francs (CHF)
 */

/**
 * Rounds an amount in CHF to nearest 0.05 CHF (5 Rappen) precision.
 */
export const roundCHF = (amount: number): number => {
  if (isNaN(amount) || amount === 0) return 0;
  // Exact Swiss commercial rounding to 5-Rappen steps
  return Math.round(amount * 20) / 20;
};

/**
 * Formats a number to a clean Swiss Francs currency string with 2 decimal places (e.g. "127.50").
 */
export const formatCHF = (amount: number): string => {
  return roundCHF(amount).toFixed(2);
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

/**
 * Cleans a Swiss IBAN by removing all whitespace and non-alphanumeric characters,
 * ensuring uppercase letters (e.g., "CH9300762011623852957").
 */
export const cleanSwissIBAN = (iban?: string): string => {
  if (!iban) return 'CH0000000000000000000';
  const cleaned = iban.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return cleaned || 'CH0000000000000000000';
};

/**
 * Formats a Swiss IBAN in standard readable 4-character blocks (e.g., "CH93 0076 2011 6238 5295 7").
 */
export const formatSwissIBAN = (iban?: string): string => {
  const cleaned = cleanSwissIBAN(iban);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Generates standard Swiss eBanking Zahlungszweck text for a given cutoff date.
 * E.g., "GetACoach Auszahlung 08/2026"
 */
export const getPaymentPurposeForDate = (cutoffDateStr: string): string => {
  try {
    const parts = cutoffDateStr.split('-');
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      return `GetACoach Auszahlung ${month}/${year}`;
    }
  } catch (e) {
    // fallback
  }
  return 'GetACoach Auszahlung';
};
