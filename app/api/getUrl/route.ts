import { type NextRequest, NextResponse } from "next/server"

// S3 bucket name
const BUCKET_NAME = "huayralucas-media"

export async function GET(request: NextRequest) {
  try {
    // Check if we're in production
    if (process.env.VERCEL_ENV !== "production") {
      return NextResponse.json({ error: "This endpoint is only available in production" }, { status: 403 })
    }

    // Dynamically import AWS SDK only in production
    const { S3Client } = await import("@aws-sdk/client-s3")
    const { fromTemporaryCredentials } = await import("@aws-sdk/credential-providers")

    // Only access AWS environment variables if we're in production
    const roleArn = process.env.AWS_ROLE_ARN
    const region = process.env.AWS_REGION || "us-east-1"

    if (!roleArn) {
      return NextResponse.json({ error: "AWS_ROLE_ARN environment variable is not set" }, { status: 500 })
    }

    // Get path from query parameters
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 })
    }

    // Create S3 client with role assumption
    const s3Client = new S3Client({
      region,
      credentials: fromTemporaryCredentials({
        masterCredentials: {
          roleArn,
          region,
        },
      }),
    })

    // For public objects, we can return the direct URL
    const directUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${path}`

    return NextResponse.json({ url: directUrl })
  } catch (error) {
    console.error("Error getting URL from S3:", error)
    return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 })
  }
}
