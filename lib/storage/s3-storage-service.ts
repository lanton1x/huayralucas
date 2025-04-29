import type { StorageService } from "./storage-interface"

// This function creates the S3 storage service without directly referencing
// environment variables at the module level
export function createS3StorageService(): StorageService {
  return {
    async uploadFile(file: File, path: string): Promise<string> {
      try {
        // Create a FormData object to send the file
        const formData = new FormData()
        formData.append("file", file)
        formData.append("path", path)

        // Call our API route that will handle the S3 upload
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        return data.url
      } catch (error) {
        console.error("Error uploading file to S3:", error)
        throw error
      }
    },

    async deleteFile(path: string): Promise<boolean> {
      try {
        const response = await fetch("/api/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        })

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.statusText}`)
        }

        return true
      } catch (error) {
        console.error("Error deleting file from S3:", error)
        throw error
      }
    },

    async getFileUrl(path: string): Promise<string> {
      try {
        // For public S3 buckets, we can construct the URL directly
        // For private buckets, we would need to generate a signed URL via API
        const response = await fetch(`/api/getUrl?path=${encodeURIComponent(path)}`)

        if (!response.ok) {
          throw new Error(`Failed to get URL: ${response.statusText}`)
        }

        const data = await response.json()
        return data.url
      } catch (error) {
        console.error("Error getting file URL from S3:", error)
        throw error
      }
    },

    async listFiles(prefix: string): Promise<string[]> {
      try {
        const response = await fetch(`/api/list?prefix=${encodeURIComponent(prefix)}`)

        if (!response.ok) {
          throw new Error(`Failed to list files: ${response.statusText}`)
        }

        const data = await response.json()
        return data.files
      } catch (error) {
        console.error("Error listing files from S3:", error)
        throw error
      }
    },
  }
}
