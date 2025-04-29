// This file contains runtime environment detection

// Check if we're running in a browser
export const isBrowser = typeof window !== "undefined"

// Function to check if we're in development mode
// This is determined at runtime, not build time
export function isDevelopment() {
  // In the browser, check for localhost or development URL patterns
  if (isBrowser) {
    const hostname = window.location.hostname
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes(".vercel.app")
  }

  // On the server, we'll default to development
  // This means AWS code won't run in development
  return true
}
