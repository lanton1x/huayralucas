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
    const { S3Client, ListObjectsV2Command } = await import("@aws-sdk/client-s3")
    const { fromTemporaryCredentials } = await import("@aws-sdk/credential-providers")

    // Only access AWS environment variables if we're in production
    const roleArn = process.env.AWS_ROLE_ARN
    const region = process.env.AWS_REGION || "us-east-1"

    if (!roleArn) {
      return NextResponse.json({ error: "AWS_ROLE_ARN environment variable is not set" }, { status: 500 })
    }

    // Get prefix from query parameters
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get("prefix") || ""

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

    // List objects in S3
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })

    const response = await s3Client.send(command)

    // Extract file paths
    const files = (response.Contents || []).map((item) => item.Key || "")

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error listing files from S3:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
