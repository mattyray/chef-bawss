/**
 * Formats a phone number as (XXX) XXX-XXXX
 * Handles partial input for live formatting
 */
export function formatPhoneNumber(value: string): string {
  // Strip all non-digits
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limited = digits.slice(0, 10);

  // Format based on length
  if (limited.length === 0) {
    return '';
  } else if (limited.length <= 3) {
    return `(${limited}`;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

/**
 * Strips formatting from phone number, returns just digits
 */
export function stripPhoneNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}
