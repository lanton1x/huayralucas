import type { StorageService } from "./storage-interface"

/**
 * Mock storage service for development
 * This has no AWS dependencies at all
 */
export class MockStorageService implements StorageService {
  private mockStorage: Map<string, string> = new Map()

  async uploadFile(file: File, path: string): Promise<string> {
    // Create a mock URL
    const mockUrl = `/mock-storage/${Date.now()}_${path}`

    // Store in our mock storage
    this.mockStorage.set(path, mockUrl)

    return mockUrl
  }

  async deleteFile(path: string): Promise<boolean> {
    this.mockStorage.delete(path)
    return true
  }

  async getFileUrl(path: string): Promise<string> {
    const url = this.mockStorage.get(path)
    if (url) return url

    // Return a placeholder if not found
    return `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(path)}`
  }

  async listFiles(prefix: string): Promise<string[]> {
    const files: string[] = []

    this.mockStorage.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        files.push(key)
      }
    })

    return files
  }
}
