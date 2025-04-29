"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { fetchGalleryContent } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkAdminAuth } from "@/lib/auth"
import { Settings } from "lucide-react"

interface MediaItem {
  id: string
  type: "video" | "photo"
  url: string
  thumbnail?: string
  year: string
  description: {
    en: string
    es: string
  }
  location: string
}

export default function Gallery() {
  const { language, t } = useLanguage()
  const [content, setContent] = useState({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    media: [] as MediaItem[],
    useDefaultBackground: true,
  })
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const getContent = async () => {
      try {
        const data = await fetchGalleryContent()
        if (data) setContent(data)
      } catch (error) {
        console.error("Failed to fetch gallery content:", error)
      }
    }

    getContent()

    // Check if user is admin
    const checkIfAdmin = async () => {
      try {
        const isAuth = await checkAdminAuth()
        setIsAdmin(isAuth)
      } catch (error) {
        console.error("Failed to check admin status:", error)
      }
    }

    checkIfAdmin()
  }, [])

  const videos = content.media.filter((item) => item.type === "video")
  const photos = content.media.filter((item) => item.type === "photo")

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="flex-1 flex flex-col pt-24 relative"
        style={{
          backgroundImage: `url(${content.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={`absolute inset-0 bg-black/${content.useDefaultBackground ? "70" : "50"} ${content.useDefaultBackground ? "backdrop-blur-md" : ""}`}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8 z-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {t("nav.gallery")}
          </h1>

          <Tabs defaultValue="all" className="w-full max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">Videos</h2>
                  {videos.map((video) => (
                    <MediaCard
                      key={video.id}
                      item={video}
                      language={language}
                      onClick={() => setSelectedMedia(video)}
                    />
                  ))}
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">Photos</h2>
                  {photos.map((photo) => (
                    <MediaCard
                      key={photo.id}
                      item={photo}
                      language={language}
                      onClick={() => setSelectedMedia(photo)}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <MediaCard key={video.id} item={video} language={language} onClick={() => setSelectedMedia(video)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="photos">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <MediaCard key={photo.id} item={photo} language={language} onClick={() => setSelectedMedia(photo)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.type === "video" ? (
                <video src={selectedMedia.url} controls className="w-full rounded-lg" />
              ) : (
                <img
                  src={selectedMedia.url || "/placeholder.svg"}
                  alt={selectedMedia.description[language as keyof typeof selectedMedia.description]}
                  className="w-full rounded-lg"
                />
              )}

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {selectedMedia.description[language as keyof typeof selectedMedia.description]}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="mr-4">{selectedMedia.year}</span>
                  <span>{selectedMedia.location}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link href="/admin/dashboard">
            <Button className="flex items-center gap-2 bg-primary/90 hover:bg-primary">
              <Settings className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        </div>
      )}
    </main>
  )
}

function MediaCard({
  item,
  language,
  onClick,
}: {
  item: MediaItem
  language: string
  onClick: () => void
}) {
  return (
    <Dialog>
      <Card className="overflow-hidden bg-black/50 backdrop-blur-sm hover:bg-black/60 transition-colors">
        <CardContent className="p-0">
          <div className="relative group">
            {item.type === "video" ? (
              <div className="aspect-video bg-muted">
                <img
                  src={item.thumbnail || item.url}
                  alt={item.description[language as keyof typeof item.description]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-muted">
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={item.description[language as keyof typeof item.description]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            <DialogTrigger asChild>
              <button
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                onClick={onClick}
              >
                <Info className="h-4 w-4" />
              </button>
            </DialogTrigger>
          </div>

          <div className="p-3">
            <p className="text-sm font-medium truncate">
              {item.description[language as keyof typeof item.description]}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {item.year} • {item.location}
            </p>
          </div>
        </CardContent>
      </Card>
    </Dialog>
  )
}
