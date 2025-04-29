/**
 * Checks if the current environment is production
 */
export function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production"
}
