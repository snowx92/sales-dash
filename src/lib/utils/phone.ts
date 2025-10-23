/**
 * Format phone number for display with country code
 * Adds +20 prefix for Egyptian numbers to make WhatsApp usage easier
 */
export function formatPhoneForDisplay(rawPhone: unknown, countryCode = '20'): string {
  // Coerce to string safely (handles numbers, null, objects)
  if (rawPhone == null) return '';
  const str = String(rawPhone).trim();
  if (str === '') return '';

  // Strip all non-digits
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';

  // If it already starts with the country code, return it
  if (digits.startsWith(countryCode)) return `+${digits}`;

  // If it starts with a leading 0, replace with country code
  if (digits.startsWith('0')) return `+${countryCode}${digits.slice(1)}`;

  // Otherwise, prepend country code
  return `+${countryCode}${digits}`;
}
