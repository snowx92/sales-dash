// Utility for building proper WhatsApp URLs with country code
// Default country code set to Egypt (20) – adjust if needed or pass explicitly.

export type WhatsAppClient = "normal" | "business";

const normalizeWhatsAppPhone = (rawPhone: string, countryCode = "20") => {
  // Strip all non-digits
  let digits = rawPhone.replace(/\D/g, '');

  // Remove leading + if present
  if (digits.startsWith('+')) digits = digits.slice(1);

  // Normalize to include country code once
  if (digits.startsWith(countryCode)) {
    // already has country code
  } else if (digits.startsWith('0')) {
    // Local format starting with 0 -> drop it and prepend country code
    digits = countryCode + digits.slice(1);
  } else {
    // Prepend country code if missing
    digits = countryCode + digits;
  }

  return digits;
};

const encodeMessageParam = (text?: string) => {
  if (!text || !text.trim()) return "";
  return `&text=${encodeURIComponent(text)}`;
};

export function buildWhatsAppUrl(rawPhone: string, text?: string, countryCode = '20') {
  const digits = normalizeWhatsAppPhone(rawPhone, countryCode);
  const messageParam = encodeMessageParam(text);

  const base = `https://api.whatsapp.com/send?phone=${digits}`;
  return `${base}${messageParam}`;
}

export function buildWhatsAppAppUrl(
  rawPhone: string,
  text: string | undefined,
  client: WhatsAppClient,
  countryCode = "20"
) {
  const digits = normalizeWhatsAppPhone(rawPhone, countryCode);
  const messageParam = encodeMessageParam(text);
  const scheme = client === "business" ? "whatsapp-business://send" : "whatsapp://send";
  return `${scheme}?phone=${digits}${messageParam}`;
}
