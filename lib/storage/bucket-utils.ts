/**
 * Converts an artist name to a valid S3 bucket name
 * - Lowercase
 * - Replace spaces with nothing
 * - Remove special characters
 * - Add '-media' suffix
 */
export function getBucketNameFromArtistName(artistName: string): string {
  if (!artistName) return "musician-media"

  return artistName
    .toLowerCase()
    .replace(/\s+/g, "") // Remove spaces
    .replace(/[^a-z0-9-]/g, "") // Remove special characters
    .concat("-media")
}

/**
 * Gets the bucket name from local storage or falls back to a default
 */
export function getBucketName(): string {
  if (typeof window !== "undefined" && window.localStorage) {
    const artistName = window.localStorage.getItem("artistName")
    if (artistName) {
      return getBucketNameFromArtistName(artistName)
    }
  }

  // Default fallback
  return "musician-media"
}

/**
 * Stores the artist name in local storage for bucket name generation
 */
export function storeArtistName(artistName: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem("artistName", artistName)
  }
}
