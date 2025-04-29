"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { fetchServicesContent } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Disc, Speaker, PartyPopper, Mic, Settings } from "lucide-react"
import { checkAdminAuth } from "@/lib/auth"

interface Service {
  id: string
  icon: string
  description: {
    en: string
    es: string
  }
}

export default function Services() {
  const { language, t } = useLanguage()
  const [content, setContent] = useState({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    useDefaultBackground: true,
    services: [
      {
        id: "singing",
        icon: "music",
        description: {
          en: "Professional singing performances for any occasion. From intimate serenades to large events.",
          es: "Actuaciones de canto profesionales para cualquier ocasión. Desde serenatas íntimas hasta grandes eventos.",
        },
      },
      {
        id: "dj",
        icon: "disc",
        description: {
          en: "DJ services with the latest equipment and extensive music library for all types of events.",
          es: "Servicios de DJ con el último equipo y una extensa biblioteca musical para todo tipo de eventos.",
        },
      },
      {
        id: "sound",
        icon: "speaker",
        description: {
          en: "High-quality sound system rental for events of all sizes. Professional setup included.",
          es: "Alquiler de equipos de sonido de alta calidad para eventos de todos los tamaños. Incluye configuración profesional.",
        },
      },
      {
        id: "animation",
        icon: "party-popper",
        description: {
          en: "Professional event animation services to keep your guests entertained and engaged.",
          es: "Servicios profesionales de animación de eventos para mantener a sus invitados entretenidos y comprometidos.",
        },
      },
      {
        id: "karaoke",
        icon: "mic",
        description: {
          en: "Karaoke services with professional equipment and an extensive song library in multiple languages.",
          es: "Servicios de karaoke con equipo profesional y una extensa biblioteca de canciones en varios idiomas.",
        },
      },
    ],
  })

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const getContent = async () => {
      try {
        const data = await fetchServicesContent()
        if (data) setContent(data)
      } catch (error) {
        console.error("Failed to fetch services content:", error)
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "music":
        return <Music className="h-10 w-10" />
      case "disc":
        return <Disc className="h-10 w-10" />
      case "speaker":
        return <Speaker className="h-10 w-10" />
      case "party-popper":
        return <PartyPopper className="h-10 w-10" />
      case "mic":
        return <Mic className="h-10 w-10" />
      default:
        return <Music className="h-10 w-10" />
    }
  }

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
            {t("nav.services")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {content.services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full bg-black/50 backdrop-blur-sm border-primary/20 overflow-hidden group hover:border-primary/50 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {getIcon(service.icon)}
                    </div>
                    <CardTitle className="text-xl">{t(`services.${service.id}`)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80">
                      {service.description[language as keyof typeof service.description]}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/contact?service=${service.id}`} className="w-full">
                      <Button variant="outline" className="w-full group-hover:bg-primary/10 transition-colors">
                        {t("contact.submit")}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
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
