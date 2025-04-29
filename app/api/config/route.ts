import { NextResponse } from "next/server"

export async function GET() {
  // Determine if we're in production based on the hostname
  const isProd = process.env.VERCEL_ENV === "production"

  // Return different configuration based on the environment
  if (isProd) {
    return NextResponse.json({
      storage: {
        type: "aws",
        config: {
          region: process.env.AWS_REGION || "us-west-2",
          bucketName: process.env.AWS_BUCKET_NAME || "musician-media",
        },
      },
    })
  } else {
    return NextResponse.json({
      storage: {
        type: "local",
        config: {},
      },
    })
  }
}
