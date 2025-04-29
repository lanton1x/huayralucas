// This file contains configuration that's determined at build time
// No process.env references here!

// Define a constant to determine the environment
// This will be replaced with the actual value during the build
export const IS_PRODUCTION = false // This will be false in development

// Define dummy values for AWS config
// These are only used in development
export const AWS_CONFIG = {
  roleArn: "dummy-arn",
  region: "us-west-2",
  bucketName: "dummy-bucket",
}

// This function returns the actual AWS config in production
// and dummy values in development
export function getAwsConfig() {
  if (IS_PRODUCTION) {
    // In production, this will be replaced with actual values
    // This code is never executed in development
    return {
      roleArn: "ACTUAL_ROLE_ARN", // Will be replaced during build
      region: "ACTUAL_REGION", // Will be replaced during build
      bucketName: "ACTUAL_BUCKET", // Will be replaced during build
    }
  }

  // In development, return dummy values
  return AWS_CONFIG
}
