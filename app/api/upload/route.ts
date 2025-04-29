import { type NextRequest, NextResponse } from "next/server"

// S3 bucket name
const BUCKET_NAME = "huayralucas-media"

export async function POST(request: NextRequest) {
  try {
    // Check if we're in production
    if (process.env.VERCEL_ENV !== "production") {
      return NextResponse.json({ error: "This endpoint is only available in production" }, { status: 403 })
    }

    // Dynamically import AWS SDK only in production
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
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

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const path = formData.get("path") as string

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // Make the file publicly accessible
    })

    await s3Client.send(command)

    // Return the URL of the uploaded file
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${path}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading to S3:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
