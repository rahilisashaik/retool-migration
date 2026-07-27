/**
 * Parse a date string (YYYY-MM-DD format) to a Date object set to start of day (00:00:00.000)
 * This avoids timezone issues that occur when using new Date(dateString) directly
 */
export function parseStartOfDay(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * Parse a date string (YYYY-MM-DD format) to a Date object set to end of day (23:59:59.999)
 * This avoids timezone issues that occur when using new Date(dateString) directly
 */
export function parseEndOfDay(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 23, 59, 59, 999)
}
