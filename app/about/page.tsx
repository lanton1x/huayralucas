"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { fetchAboutContent } from "@/lib/api"
import { Markdown } from "@/components/markdown"
import { Button } from "@/components/ui/button"
import { checkAdminAuth } from "@/lib/auth"
import { Settings } from "lucide-react"

export default function About() {
  const { language } = useLanguage()
  const [content, setContent] = useState({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    content: {
      en: "# About Me\n\nI am a passionate musician with years of experience...",
      es: "# Bio\n\nSoy un músico apasionado con años de experiencia...",
    },
    useDefaultBackground: true,
  })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const getContent = async () => {
      try {
        const data = await fetchAboutContent()
        if (data) setContent(data)
      } catch (error) {
        console.error("Failed to fetch about content:", error)
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
          <div className="max-w-3xl mx-auto bg-black/50 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-xl">
            <Markdown content={content.content[language as keyof typeof content.content]} />
          </div>
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
