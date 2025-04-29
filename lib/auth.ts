// This is a mock authentication implementation
// In a real application, this would connect to a secure authentication system with 2FA

// Mock user data
const adminUser = {
  username: "admin",
  password: "password123", // In a real app, this would be hashed
}

// Use localStorage to persist authentication state
const getAuthState = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminAuthenticated") === "true"
  }
  return false
}

const setAuthState = (state: boolean) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("adminAuthenticated", state ? "true" : "false")
  }
}

export async function loginAdmin({ username, password }: { username: string; password: string }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (username === adminUser.username && password === adminUser.password) {
    // In a real app, this would generate a session token and set a cookie
    return { success: true }
  }

  return { success: false, error: "Invalid credentials" }
}

export async function verifyTwoFactor(code: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // In a real app, this would verify the 2FA code against a proper authenticator
  // For demo purposes, any 6-digit code is accepted
  if (code.length === 6 && /^\d+$/.test(code)) {
    setAuthState(true)
    return { success: true }
  }

  return { success: false, error: "Invalid 2FA code" }
}

export async function checkAdminAuth() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real app, this would verify the session token
  return getAuthState()
}

export async function logoutAdmin() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real app, this would invalidate the session token
  setAuthState(false)
  return { success: true }
}
