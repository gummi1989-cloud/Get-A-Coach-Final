/**
 * Swiss IBAN Validation Utility using ISO 13616 Modulo-97 Algorithm
 */

const mod97 = (numericStr: string): number => {
  let checksum = 0;
  for (let i = 0; i < numericStr.length; i++) {
    checksum = (checksum * 10 + parseInt(numericStr.charAt(i), 10)) % 97;
  }
  return checksum;
};

export interface IBANValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Validates a Swiss IBAN according to ISO 13616 Modulo-97.
 * Swiss IBAN format: CHxx xxxx xxxx xxxx x (21 characters starting with CH)
 */
export const validateSwissIBAN = (iban: string): IBANValidationResult => {
  if (!iban || !iban.trim()) {
    return { isValid: false, formatted: '', error: 'Bitte gib eine Schweizer IBAN ein.' };
  }

  const clean = iban.replace(/\s+/g, '').toUpperCase();

  if (!clean.startsWith('CH')) {
    return { isValid: false, formatted: clean, error: 'Bitte gib eine gültige Schweizer IBAN ein (muss mit CH beginnen).' };
  }

  if (clean.length !== 21) {
    return { isValid: false, formatted: clean, error: 'Bitte gib eine gültige Schweizer IBAN ein (muss genau 21 Zeichen lang sein).' };
  }

  if (!/^CH\d{2}[A-Z0-9]{17}$/.test(clean)) {
    return { isValid: false, formatted: clean, error: 'Bitte gib eine gültige Schweizer IBAN ein.' };
  }

  // ISO 13616 Modulo-97 Check:
  // Move CHxx (first 4 chars) to the end
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Convert letters to numbers (A=10, B=11 ... Z=35)
  let numericStr = '';
  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged.charAt(i);
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // A-Z
      numericStr += (code - 55).toString();
    } else {
      numericStr += char;
    }
  }

  const remainder = mod97(numericStr);
  if (remainder !== 1) {
    return { isValid: false, formatted: clean, error: 'Bitte gib eine gültige Schweizer IBAN ein.' };
  }

  // Format with space every 4 characters: CHxx xxxx xxxx xxxx x
  const formatted = clean.replace(/(.{4})/g, '$1 ').trim();
  return { isValid: true, formatted };
};
