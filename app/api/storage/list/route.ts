import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Check if we're in production (ENV is not 'dev')
  const isProd = process.env.ENV !== "dev"

  if (isProd) {
    try {
      // Dynamic imports to avoid reference to AWS SDK during build
      const AWS = await import("@aws-sdk/client-s3")
      const { fromTemporaryCredentials } = await import("@aws-sdk/credential-providers")

      const { searchParams } = new URL(request.url)
      const prefix = searchParams.get("prefix") || ""

      // Get credentials from environment variables
      const roleArn = process.env.AWS_ROLE_ARN
      const region = process.env.AWS_REGION || "us-west-2"
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

      // List objects in S3
      const command = new AWS.ListObjectsV2Command({
        Bucket: bucketName,
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
  } else {
    // Development code - return a mock response
    return NextResponse.json({ files: [] })
  }
}
