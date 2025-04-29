import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Only run in production
    if (process.env.VERCEL_ENV !== "production") {
      return NextResponse.json({ error: "This endpoint is only available in production" }, { status: 403 })
    }

    // Dynamically import AWS SDK
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
    const { fromTemporaryCredentials } = await import("@aws-sdk/credential-providers")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const path = formData.get("path") as string

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required" }, { status: 400 })
    }

    // Get credentials from environment variables
    const roleArn = process.env.AWS_ROLE_ARN
    const region = process.env.AWS_REGION || "us-east-1"
    const bucketName = process.env.AWS_BUCKET_NAME || "musician-media"

    if (!roleArn) {
      return NextResponse.json({ error: "AWS credentials not configured" }, { status: 500 })
    }

    // Create S3 client
    const s3Client = new S3Client({
      region,
      credentials: fromTemporaryCredentials({
        masterCredentials: {
          roleArn,
          region,
        },
      }),
    })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    })

    await s3Client.send(command)

    // Return the URL of the uploaded file
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${path}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading to S3:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
