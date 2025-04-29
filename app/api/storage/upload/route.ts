import { type NextRequest, NextResponse } from "next/server"

// Helper function to get the configuration
async function getConfig() {
  const response = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/config`)
  if (!response.ok) {
    throw new Error("Failed to fetch configuration")
  }
  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    // Get the configuration
    const config = await getConfig()

    // If we're using local storage, return a mock response
    if (config.storage.type === "local") {
      const formData = await request.formData()
      const file = formData.get("file") as File

      // Create a mock URL for development
      const mockUrl = `/mock-storage/${Date.now()}_${file?.name || "file"}`

      return NextResponse.json({ url: mockUrl })
    }

    // Production code - dynamically import AWS SDK
    const AWS = await import("@aws-sdk/client-s3")
    const { fromTemporaryCredentials } = await import("@aws-sdk/credential-providers")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const path = formData.get("path") as string

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required" }, { status: 400 })
    }

    // Get credentials from environment variables
    const roleArn = process.env.AWS_ROLE_ARN
    const region = config.storage.config.region
    const bucketName = config.storage.config.bucketName

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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to S3
    const command = new AWS.PutObjectCommand({
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
