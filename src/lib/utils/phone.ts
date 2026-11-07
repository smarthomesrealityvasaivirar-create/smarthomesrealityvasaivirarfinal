/** Normalise an Indian mobile to 10 digits, or null if invalid. Accepts +91, 0 prefix, spaces, dashes. */
export function normalizeIndianMobile(input: string): string | null {
  let d = input.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return /^[6-9]\d{9}$/.test(d) ? d : null
}
