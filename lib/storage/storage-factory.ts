import type { StorageService } from "./storage-interface"

// Cache for the config
let configCache: any = null

// This factory function returns the appropriate storage service
export async function createStorageService(): Promise<StorageService> {
  try {
    // Get the configuration from the API if we don't have it cached
    if (!configCache) {
      const response = await fetch("/api/config")
      if (!response.ok) {
        throw new Error("Failed to fetch configuration")
      }
      configCache = await response.json()
    }

    // Use the appropriate storage service based on the configuration
    if (configCache.storage.type === "aws") {
      // Use dynamic import to prevent static analysis
      const module = await import("./production-storage-service")
      return new module.ProductionStorageService(configCache.storage.config)
    } else {
      // Use local storage
      const { LocalStorageService } = await import("./local-storage-service")
      return new LocalStorageService()
    }
  } catch (error) {
    console.error("Error creating storage service:", error)
    // Fallback to local storage in case of errors
    const { LocalStorageService } = await import("./local-storage-service")
    return new LocalStorageService()
  }
}
