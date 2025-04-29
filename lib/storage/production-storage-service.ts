import type { StorageService } from "./storage-interface"

/**
 * Production storage service
 * This file is only imported in production
 */
export class ProductionStorageService implements StorageService {
  private config: any

  constructor(config: any) {
    this.config = config
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("path", path)

      // Call our API route that will handle the upload
      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const response = await fetch("/api/storage/delete", {
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
      console.error("Error deleting file:", error)
      throw error
    }
  }

  async getFileUrl(path: string): Promise<string> {
    // Get the URL from the API
    try {
      const response = await fetch(`/api/storage/getUrl?path=${encodeURIComponent(path)}`)

      if (!response.ok) {
        throw new Error(`Failed to get URL: ${response.statusText}`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error getting file URL:", error)
      // Fallback to a direct URL format if the API fails
      return `/api/storage/file/${encodeURIComponent(path)}`
    }
  }

  async listFiles(prefix: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/storage/list?prefix=${encodeURIComponent(prefix)}`)

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`)
      }

      const data = await response.json()
      return data.files
    } catch (error) {
      console.error("Error listing files:", error)
      throw error
    }
  }
}
