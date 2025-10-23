/**
 * Format phone number for display with country code
 * Adds +20 prefix for Egyptian numbers to make WhatsApp usage easier
 */
export function formatPhoneForDisplay(rawPhone: string, countryCode = '20'): string {
  if (!rawPhone || rawPhone.trim() === '') {
    return '';
  }

  // Strip all non-digits
  let digits = rawPhone.replace(/\D/g, '');

  // Remove leading + if present
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }

  // Check if it already has the country code
  if (digits.startsWith(countryCode)) {
    return `+${digits}`;
  }

  // If it starts with 0, replace with country code
  if (digits.startsWith('0')) {
    return `+${countryCode}${digits.slice(1)}`;
  }

  // Otherwise, prepend country code
  return `+${countryCode}${digits}`;
}
