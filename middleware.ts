import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Set a global variable for environment detection
  // This will be available at runtime but not during build
  if (typeof global !== "undefined") {
    global.__VERCEL_ENV = process.env.VERCEL_ENV || "development"
  }

  return NextResponse.next()
}

// Configure the middleware to run on all routes
export const config = {
  matcher: "/:path*",
}
