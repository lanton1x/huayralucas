const fs = require("fs")
const path = require("path")

// Path to the storage-config.ts file
const configPath = path.join(__dirname, "../lib/storage/storage-config.ts")

// Read the file
let content = fs.readFileSync(configPath, "utf8")

// Replace the IS_PRODUCTION constant
content = content.replace("export const IS_PRODUCTION = false", "export const IS_PRODUCTION = true")

// Replace the AWS config values
content = content.replace("'ACTUAL_ROLE_ARN'", `'${process.env.AWS_ROLE_ARN || "dummy-arn"}'`)
content = content.replace("'ACTUAL_REGION'", `'${process.env.AWS_REGION || "us-west-2"}'`)
content = content.replace("'ACTUAL_BUCKET'", `'${process.env.AWS_BUCKET_NAME || "dummy-bucket"}'`)

// Write the file back
fs.writeFileSync(configPath, content)

console.log("Environment variables replaced in storage-config.ts")
