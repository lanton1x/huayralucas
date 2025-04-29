import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Check if we're in production (ENV is not 'dev')
  const isProd = process.env.ENV !== "dev"

  if (isProd) {
    try {
      const { searchParams } = new URL(request.url)
      const path = searchParams.get("path")

      if (!path) {
        return NextResponse.json({ error: "Path is required" }, { status: 400 })
      }

      // Get environment variables at runtime only
      const region = process.env.AWS_REGION || "us-east-1"
      const bucketName = process.env.AWS_BUCKET_NAME || "musician-media"

      // For public objects, we can return the direct URL
      const directUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${path}`

      return NextResponse.json({ url: directUrl })
    } catch (error) {
      console.error("Error getting URL from S3:", error)
      return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 })
    }
  } else {
    // Development code - return a mock URL
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || ""

    return NextResponse.json({ url: `/mock-storage/${path}` })
  }
}
