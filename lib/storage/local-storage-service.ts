import type { StorageService } from "./storage-interface"

// IndexedDB database name and version
const DB_NAME = "musician-portfolio-media"
const DB_VERSION = 1
const STORE_NAME = "media-files"

export class LocalStorageService implements StorageService {
  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase>

  constructor() {
    this.dbPromise = this.initDatabase()
  }

  private async initDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("IndexedDB is not available in this environment"))
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = (event) => {
        console.error("IndexedDB error:", event)
        reject(new Error("Could not open IndexedDB"))
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "path" })
        }
      }
    })
  }

  async uploadFile(file: File, path: string): Promise<string> {
    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      // Read the file as an ArrayBuffer
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const fileData = event.target?.result
          if (!fileData) {
            throw new Error("Failed to read file")
          }

          // Store file in IndexedDB
          const transaction = db.transaction([STORE_NAME], "readwrite")
          const store = transaction.objectStore(STORE_NAME)

          const mediaItem = {
            path,
            type: file.type,
            data: fileData,
            lastModified: new Date().toISOString(),
          }

          const request = store.put(mediaItem)

          request.onsuccess = () => {
            // Create and return an object URL for immediate use
            const objectUrl = URL.createObjectURL(file)

            // Store the mapping between path and objectUrl in sessionStorage
            // This is temporary and will be lost on page refresh
            if (typeof sessionStorage !== "undefined") {
              const urlMap = JSON.parse(sessionStorage.getItem("mediaUrlMap") || "{}")
              urlMap[path] = objectUrl
              sessionStorage.setItem("mediaUrlMap", JSON.stringify(urlMap))
            }

            resolve(objectUrl)
          }

          request.onerror = () => {
            reject(new Error(`Failed to store file at path: ${path}`))
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  async deleteFile(path: string): Promise<boolean> {
    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(path)

      request.onsuccess = () => {
        // Also remove from the URL map if it exists
        if (typeof sessionStorage !== "undefined") {
          const urlMap = JSON.parse(sessionStorage.getItem("mediaUrlMap") || "{}")
          if (urlMap[path]) {
            URL.revokeObjectURL(urlMap[path])
            delete urlMap[path]
            sessionStorage.setItem("mediaUrlMap", JSON.stringify(urlMap))
          }
        }
        resolve(true)
      }

      request.onerror = () => {
        reject(new Error(`Failed to delete file at path: ${path}`))
      }
    })
  }

  async getFileUrl(path: string): Promise<string> {
    // First check if we have a cached object URL
    if (typeof sessionStorage !== "undefined") {
      const urlMap = JSON.parse(sessionStorage.getItem("mediaUrlMap") || "{}")
      if (urlMap[path]) {
        return urlMap[path]
      }
    }

    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(path)

      request.onsuccess = () => {
        const mediaItem = request.result
        if (!mediaItem) {
          // If file doesn't exist, return a placeholder
          resolve(`/placeholder.svg?height=600&width=600&query=Missing+file+${encodeURIComponent(path)}`)
          return
        }

        // Create a blob from the stored data
        const blob = new Blob([mediaItem.data], { type: mediaItem.type })
        const objectUrl = URL.createObjectURL(blob)

        // Cache the object URL
        if (typeof sessionStorage !== "undefined") {
          const urlMap = JSON.parse(sessionStorage.getItem("mediaUrlMap") || "{}")
          urlMap[path] = objectUrl
          sessionStorage.setItem("mediaUrlMap", JSON.stringify(urlMap))
        }

        resolve(objectUrl)
      }

      request.onerror = () => {
        reject(new Error(`Failed to retrieve file at path: ${path}`))
      }
    })
  }

  async listFiles(prefix: string): Promise<string[]> {
    const db = await this.dbPromise

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.openCursor()

      const paths: string[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue

        if (cursor) {
          const path = cursor.value.path
          if (path.startsWith(prefix)) {
            paths.push(path)
          }
          cursor.continue()
        } else {
          resolve(paths)
        }
      }

      request.onerror = () => {
        reject(new Error(`Failed to list files with prefix: ${prefix}`))
      }
    })
  }
}
