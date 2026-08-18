/**
 * Utility to sanitize data before writing to Firestore.
 * Firestore strictly disallows `undefined` values in documents.
 * This utility converts `undefined` to `null` or cleans nested objects/arrays recursively.
 */
export function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' && item !== null ? cleanForFirestore(item) : (item === undefined ? null : item)));
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      result[key] = null;
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = cleanForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
