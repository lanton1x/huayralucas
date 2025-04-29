import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  // Check if we're in production (ENV is not 'dev')
  const isProd = process.env.ENV !== "dev"

  if (isProd) {
    // Production code - dynamically import AWS SDK
    try {
      // Dynamic imports to avoid reference to AWS SDK during build
      const AWS = await import("@aws-sdk/client-s3")
      const { fromTemporaryCredentials } = await import("@aws-sdk/credential-providers")

      const { path } = await request.json()

      if (!path) {
        return NextResponse.json({ error: "Path is required" }, { status: 400 })
      }

      // Get credentials from environment variables
      const roleArn = process.env.AWS_ROLE_ARN
      const region = process.env.AWS_REGION || "us-east-1"
      const bucketName = process.env.AWS_BUCKET_NAME || "musician-media"

      if (!roleArn) {
        return NextResponse.json({ error: "AWS credentials not configured" }, { status: 500 })
      }

      // Create S3 client
      const s3Client = new AWS.S3Client({
        region,
        credentials: fromTemporaryCredentials({
          masterCredentials: {
            roleArn,
            region,
          },
        }),
      })

      // Delete from S3
      const command = new AWS.DeleteObjectCommand({
        Bucket: bucketName,
        Key: path,
      })

      await s3Client.send(command)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting from S3:", error)
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
    }
  } else {
    // Development code - return a mock success response
    return NextResponse.json({ success: true })
  }
}
