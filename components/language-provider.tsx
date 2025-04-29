"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "es"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    "nav.home": "Home",
    "nav.about": "About Me",
    "nav.gallery": "Gallery",
    "nav.services": "Services",
    "nav.contact": "Contact Me",
    "services.singing": "Singing Performance - Serenade",
    "services.dj": "DJ",
    "services.sound": "Sound System Rental",
    "services.animation": "Parties-Events Animation",
    "services.karaoke": "Karaoke",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.service": "Service",
    "contact.submit": "Submit",
    "admin.login": "Admin Login",
    "admin.dashboard": "Dashboard",
    "admin.logout": "Logout",
  },
  es: {
    "nav.home": "Inicio",
    "nav.about": "Bio",
    "nav.gallery": "Galería",
    "nav.services": "Servicios",
    "nav.contact": "Contacto",
    "services.singing": "Canto - Serenatas",
    "services.dj": "DJ",
    "services.sound": "Alquiler Equipos Sonido",
    "services.animation": "Animación de Fiestas y Eventos",
    "services.karaoke": "Karaoke",
    "contact.name": "Nombre",
    "contact.email": "Correo",
    "contact.message": "Mensaje",
    "contact.service": "Servicio",
    "contact.submit": "Enviar",
    "admin.login": "Iniciar Sesión",
    "admin.dashboard": "Panel de Control",
    "admin.logout": "Cerrar Sesión",
  },
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string) => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
