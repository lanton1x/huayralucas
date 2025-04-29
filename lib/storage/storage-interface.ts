// Define the interface for our storage methods
export interface StorageService {
  // File operations
  uploadFile: (file: File, path: string) => Promise<string> // Returns URL
  deleteFile: (path: string) => Promise<boolean>
  getFileUrl: (path: string) => Promise<string>

  // List operations
  listFiles: (prefix: string) => Promise<string[]>
}

// We'll import the factory function directly where needed
// to avoid circular dependencies
