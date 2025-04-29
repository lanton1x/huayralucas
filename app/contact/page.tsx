"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { fetchContactContent, submitContactForm } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Markdown from "react-markdown"
import { checkAdminAuth } from "@/lib/auth"
import { Settings } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  service: z.string().optional(),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function Contact() {
  const { language, t } = useLanguage()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [content, setContent] = useState({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    contactInfo: {
      en: "# Get in Touch\n\nFeel free to reach out for bookings, questions, or collaborations.",
      es: "# Contáctame\n\nNo dudes en contactarme para reservas, preguntas o colaboraciones.",
    },
    useDefaultBackground: true,
  })
  const [isAdmin, setIsAdmin] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      service: searchParams.get("service") || "",
      message: "",
    },
  })

  useEffect(() => {
    const getContent = async () => {
      try {
        const data = await fetchContactContent()
        if (data) setContent(data)
      } catch (error) {
        console.error("Failed to fetch contact content:", error)
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await submitContactForm(values)
      toast({
        title: language === "en" ? "Message sent!" : "¡Mensaje enviado!",
        description:
          language === "en"
            ? "Thank you for your message. I'll get back to you soon."
            : "Gracias por tu mensaje. Me pondré en contacto contigo pronto.",
      })
      form.reset()
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "Error",
        description:
          language === "en"
            ? "There was a problem sending your message. Please try again."
            : "Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
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
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <div>
              <Card className="bg-black/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    {t("nav.contact")}
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    <div className="mt-4">
                      <div className="markdown prose prose-invert max-w-none">
                        <Markdown content={content.contactInfo[language as keyof typeof content.contactInfo]} />
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div>
              <Card className="bg-black/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>{language === "en" ? "Contact Form" : "Formulario de Contacto"}</CardTitle>
                  <CardDescription>
                    {language === "en"
                      ? "Fill out the form below to get in touch."
                      : "Completa el formulario a continuación para ponerte en contacto."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.name")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("contact.name")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.email")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("contact.email")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.service")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={language === "en" ? "Select a service" : "Selecciona un servicio"}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">
                                  {language === "en" ? "General Inquiry" : "Consulta General"}
                                </SelectItem>
                                <SelectItem value="singing">{t("services.singing")}</SelectItem>
                                <SelectItem value="dj">{t("services.dj")}</SelectItem>
                                <SelectItem value="sound">{t("services.sound")}</SelectItem>
                                <SelectItem value="animation">{t("services.animation")}</SelectItem>
                                <SelectItem value="karaoke">{t("services.karaoke")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.message")}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={language === "en" ? "Your message..." : "Tu mensaje..."}
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        {t("contact.submit")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
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
