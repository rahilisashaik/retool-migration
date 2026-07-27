/**
 * Format a date to a localized string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(undefined, options)
}

/**
 * Format a date to a localized date string (no time)
 */
export function formatDateString(date: string | Date): string {
  return formatDate(date, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

/**
 * Format a currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  return `${value}%`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format a key to be URL-friendly (lowercase, alphanumeric with underscores)
 */
export function formatKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9_]/g, '_')
}
