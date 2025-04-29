"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { X, ImageIcon, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DragDropUploadProps {
  onFileDrop: (file: File) => void
  accept?: string
  className?: string
  maxSize?: number // in MB
  previewUrl?: string
  label?: string
  description?: string
  height?: string
}

export default function DragDropUpload({
  onFileDrop,
  accept = "image/*",
  className,
  maxSize = 10, // Default 10MB
  previewUrl,
  label = "Drop file here",
  description = "or click to browse",
  height = "h-64",
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(previewUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isVideo = accept.includes("video")

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      setError(null)

      const files = e.dataTransfer.files
      handleFiles(files)
    },
    [onFileDrop],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const files = e.target.files
      if (files) {
        handleFiles(files)
      }
    },
    [onFileDrop],
  )

  const handleFiles = useCallback(
    (files: FileList) => {
      if (files.length === 0) return

      const file = files[0]

      // Check file type
      if (!file.type.match(accept.replace("*", ".*"))) {
        setError(`Invalid file type. Please upload ${accept.includes("image") ? "an image" : "a video"}.`)
        return
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSize}MB.`)
        return
      }

      // Create preview
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith("video/")) {
        const videoUrl = URL.createObjectURL(file)
        setPreview(videoUrl)
      }

      // Pass file to parent component
      onFileDrop(file)
    },
    [accept, maxSize, onFileDrop],
  )

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleClearPreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          height,
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : error
              ? "border-destructive bg-destructive/10"
              : "border-border bg-muted/40 hover:bg-muted/60",
          "cursor-pointer",
        )}
        animate={{
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept={accept} onChange={handleFileInput} />

        {preview ? (
          <div className="relative h-full w-full">
            {isVideo ? (
              <video src={preview} className="h-full w-full rounded-md object-cover" controls />
            ) : (
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="h-full w-full rounded-md object-cover"
              />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={handleClearPreview}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              {isVideo ? <FileVideo className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
            </div>
            <p className="mb-1 text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </>
        )}
      </motion.div>
    </div>
  )
}
