import { type NextRequest, NextResponse } from "next/server"

// S3 bucket name
const BUCKET_NAME = "huayralucas-media"

export async function DELETE(request: NextRequest) {
  try {
    // Check if we're in production
    if (process.env.VERCEL_ENV !== "production") {
      return NextResponse.json({ error: "This endpoint is only available in production" }, { status: 403 })
    }

    // Dynamically import AWS SDK only in production
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3")
    const { fromTemporaryCredentials } = await import("@aws-sdk/credential-providers")

    // Only access AWS environment variables if we're in production
    const roleArn = process.env.AWS_ROLE_ARN
    const region = process.env.AWS_REGION || "us-east-1"

    if (!roleArn) {
      return NextResponse.json({ error: "AWS_ROLE_ARN environment variable is not set" }, { status: 500 })
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

    // Parse the request body
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 })
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    })

    await s3Client.send(command)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting from S3:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
