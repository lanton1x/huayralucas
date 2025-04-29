"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { loginAdmin, verifyTwoFactor } from "@/lib/auth"

export default function AdminLogin() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [authCode, setAuthCode] = useState("")

  // UI states
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [codeError, setCodeError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")

    if (!username || !password) {
      setLoginError(language === "en" ? "Username and password are required" : "Usuario y contraseña son requeridos")
      return
    }

    setIsLoading(true)

    try {
      const result = await loginAdmin({ username, password })
      if (result.success) {
        // Clear password for security
        setPassword("")
        // Show 2FA form
        setShowTwoFactor(true)
      } else {
        setLoginError(language === "en" ? "Invalid username or password" : "Usuario o contraseña inválidos")
      }
    } catch (error) {
      setLoginError(
        language === "en" ? "An error occurred. Please try again." : "Ocurrió un error. Por favor, inténtalo de nuevo.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTwoFactorVerify(e: React.FormEvent) {
    e.preventDefault()
    setCodeError("")

    if (!authCode || authCode.length !== 6 || !/^\d+$/.test(authCode)) {
      setCodeError(
        language === "en" ? "Please enter a valid 6-digit code" : "Por favor, ingresa un código válido de 6 dígitos",
      )
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyTwoFactor(authCode)
      if (result.success) {
        toast({
          title: language === "en" ? "Success" : "Éxito",
          description: language === "en" ? "Login successful!" : "¡Inicio de sesión exitoso!",
        })
        router.push("/admin/dashboard")
      } else {
        setCodeError(language === "en" ? "Invalid verification code" : "Código de verificación inválido")
        setAuthCode("") // Clear the code field on error
      }
    } catch (error) {
      setCodeError(
        language === "en" ? "An error occurred. Please try again." : "Ocurrió un error. Por favor, inténtalo de nuevo.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Function to go back to login screen
  function handleBackToLogin() {
    setShowTwoFactor(false)
    setAuthCode("")
    setCodeError("")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-purple-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 bg-black/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {t("admin.login")}
            </CardTitle>
            <CardDescription className="text-center">
              {language === "en"
                ? "Login to access the admin dashboard"
                : "Inicia sesión para acceder al panel de administración"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showTwoFactor ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    {language === "en" ? "Username" : "Usuario"}
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {language === "en" ? "Password" : "Contraseña"}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {loginError && <div className="text-destructive text-sm">{loginError}</div>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? language === "en"
                      ? "Logging in..."
                      : "Iniciando sesión..."
                    : language === "en"
                      ? "Login"
                      : "Iniciar Sesión"}
                </Button>
              </form>
            ) : (
              // Two-Factor Authentication Form
              <form onSubmit={handleTwoFactorVerify} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="authCode" className="text-sm font-medium">
                    {language === "en" ? "Two-Factor Authentication Code" : "Código de Autenticación de Dos Factores"}
                  </label>
                  <Input
                    id="authCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={authCode}
                    onChange={(e) => {
                      // Only allow digits and max 6 characters
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setAuthCode(value)
                    }}
                    disabled={isLoading}
                    className="text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {language === "en"
                      ? "Enter the 6-digit code from your authenticator app"
                      : "Ingresa el código de 6 dígitos de tu aplicación de autenticación"}
                  </p>
                </div>

                {codeError && <div className="text-destructive text-sm text-center">{codeError}</div>}

                <div className="flex flex-col space-y-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? language === "en"
                        ? "Verifying..."
                        : "Verificando..."
                      : language === "en"
                        ? "Verify"
                        : "Verificar"}
                  </Button>

                  <Button type="button" variant="ghost" onClick={handleBackToLogin} disabled={isLoading}>
                    {language === "en" ? "Back to Login" : "Volver al Inicio de Sesión"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              {language === "en"
                ? "Admin access only. Unauthorized access is prohibited."
                : "Solo acceso de administrador. El acceso no autorizado está prohibido."}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  )
}
