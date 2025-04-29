"use client"

import type React from "react"

import { useState } from "react"
import { isDevelopment } from "@/lib/environment"

interface DevFileUploaderProps {
  onUpload: (url: string) => void
  accept?: string
  className?: string
}

export default function DevFileUploader({ onUpload, accept = "image/*", className }: DevFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  // Only show in development
  if (!isDevelopment()) {
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Create a mock URL for development
      const mockUrl = URL.createObjectURL(file)

      // Call the onUpload callback with the mock URL
      onUpload(mockUrl)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={className}>
      <div className="p-2 bg-yellow-100 text-yellow-800 rounded mb-2 text-xs">
        Development Mode: Files are stored locally and will not persist
      </div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/80"
      />
    </div>
  )
}
