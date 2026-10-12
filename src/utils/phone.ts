/**
 * Phone number and WhatsApp URL validation & formatting utilities.
 */

/**
 * Extracts digits from a phone/whatsapp string, stripping formatting like +, spaces, dashes, parentheses.
 */
export function cleanPhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  return rawPhone.replace(/\D/g, '');
}

/**
 * Checks whether a phone string contains a valid usable phone number.
 * Requires at least 7 digits (local/international standard).
 */
export function isValidPhoneNumber(rawPhone?: string | null): boolean {
  const digits = cleanPhoneNumber(rawPhone);
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validates and formats a WhatsApp phone number for use with wa.me URLs.
 * - Handles leading zeros, country codes (defaults to 91 for 10-digit Indian numbers).
 * - Returns null if the number is missing or invalid.
 */
export function formatWhatsAppUrl(rawWhatsApp?: string | null): string | null {
  if (!rawWhatsApp || typeof rawWhatsApp !== 'string') return null;
  
  let digits = cleanPhoneNumber(rawWhatsApp);
  if (!digits) return null;

  // Remove leading zeros
  digits = digits.replace(/^0+/, '');

  // If 10-digit Indian mobile number, prefix with India country code 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  // Valid international WhatsApp numbers range from 10 to 15 digits
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  return `https://wa.me/${digits}`;
}
