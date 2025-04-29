"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { fetchHomeContent } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { checkAdminAuth } from "@/lib/auth"
import { Settings } from "lucide-react"

export default function Home() {
  const { language } = useLanguage()
  const [content, setContent] = useState({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    profileImage: "/placeholder.svg?height=400&width=400",
    artistName: "Musician Portfolio",
    navbarTitle: "Musician",
    introText: {
      en: "Welcome to my musical world",
      es: "Bienvenido a mi mundo musical",
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const getContent = async () => {
      try {
        setIsLoading(true)
        const data = await fetchHomeContent()
        if (data) setContent(data)
      } catch (error) {
        console.error("Failed to fetch home content:", error)
      } finally {
        setIsLoading(false)
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

  // Add useEffect for image preloading and optimization
  useEffect(() => {
    // Preload the background image for better performance
    if (content.backgroundImage) {
      const img = new Image()
      img.src = content.backgroundImage
    }
  }, [content.backgroundImage])

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="flex-1 flex flex-col items-center justify-center relative"
        style={{
          backgroundImage: `url(${content.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center text-center px-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative mb-8 rounded-full overflow-hidden border-4 border-primary/50 shadow-xl shadow-primary/20"
          >
            <img
              src={content.profileImage || "/placeholder.svg"}
              alt={content.artistName}
              className="w-48 h-48 md:w-64 md:h-64 object-cover"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          >
            {content.artistName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-xl md:text-2xl max-w-2xl text-white/90"
          >
            {content.introText[language as keyof typeof content.introText]}
          </motion.p>
        </motion.div>
      </div>
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
