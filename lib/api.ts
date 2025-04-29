// This is a mock API implementation
// In a real application, this would connect to AWS S3 and a database
import { createStorageService } from "./storage/storage-factory"

// Create a global storage for our data that persists across page loads
// In a real app, this would be a database
if (typeof window !== "undefined") {
  if (!window.appData) {
    window.appData = {
      homeData: {
        backgroundImage: "/placeholder.svg?height=1080&width=1920",
        profileImage: "/placeholder.svg?height=400&width=400",
        artistName: "Musician Portfolio",
        navbarTitle: {
          en: "Musician",
          es: "Músico",
        },
        introText: {
          en: "Welcome to my musical world",
          es: "Bienvenido a mi mundo musical",
        },
      },
      aboutData: {
        backgroundImage: "/placeholder.svg?height=1080&width=1920",
        content: {
          en: "# About Me\n\nI am a passionate musician with years of experience in the industry. My journey began when I was just a child, and music has been my constant companion ever since.\n\n## My Journey\n\nI've performed at numerous venues across the country, bringing joy and entertainment to thousands of people. My versatile style allows me to adapt to different genres and settings.\n\n## Philosophy\n\nI believe music is a universal language that connects people across cultures and backgrounds. Through my performances, I aim to create memorable experiences that resonate with audiences long after the event is over.",
          es: "# Bio\n\nSoy un músico apasionado con años de experiencia en la industria. Mi viaje comenzó cuando era solo un niño, y la música ha sido mi compañera constante desde entonces.\n\n## Mi Trayectoria\n\nHe actuado en numerosos lugares en todo el país, llevando alegría y entretenimiento a miles de personas. Mi estilo versátil me permite adaptarme a diferentes géneros y entornos.\n\n## Filosofía\n\nCreo que la música es un lenguaje universal que conecta a las personas a través de culturas y orígenes. A través de mis actuaciones, pretendo crear experiencias memorables que resuenen con el público mucho después de que el evento haya terminado.",
        },
      },
      galleryData: {
        backgroundImage: "/placeholder.svg?height=1080&width=1920",
        media: [
          {
            id: "1",
            type: "photo",
            url: "/placeholder.svg?height=600&width=600",
            year: "2023",
            description: {
              en: "Live performance at Summer Festival",
              es: "Actuación en vivo en el Festival de Verano",
            },
            location: "Miami, FL",
          },
          {
            id: "2",
            type: "video",
            url: "https://example.com/sample-video.mp4",
            thumbnail: "/placeholder.svg?height=600&width=600",
            year: "2022",
            description: {
              en: "DJ set at Club Atmosphere",
              es: "Set de DJ en Club Atmosphere",
            },
            location: "New York, NY",
          },
        ],
      },
      servicesData: {
        backgroundImage: "/placeholder.svg?height=1080&width=1920",
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
      },
      contactData: {
        backgroundImage: "/placeholder.svg?height=1080&width=1920",
        contactInfo: {
          en: "# Get in Touch\n\nFeel free to reach out for bookings, questions, or collaborations. I'm always open to new opportunities and would love to be a part of your next event.\n\n## Availability\n\nI'm currently available for bookings throughout the year. Early reservation is recommended for weekend events and holiday seasons.",
          es: "# Contáctame\n\nNo dudes en contactarme para reservas, preguntas o colaboraciones. Siempre estoy abierto a nuevas oportunidades y me encantaría ser parte de tu próximo evento.\n\n## Disponibilidad\n\nActualmente estoy disponible para reservas durante todo el año. Se recomienda reservar con anticipación para eventos de fin de semana y temporadas festivas.",
        },
      },
      fileStorage: {},
    }
  }
}

// Add this helper function at the top of the file, after any imports
function getBackgroundImage(pageData, defaultImage) {
  // If the page has its own background image and it's not empty, use it
  if (pageData?.backgroundImage && pageData.backgroundImage !== "/placeholder.svg?height=1080&width=1920") {
    return pageData.backgroundImage
  }
  // Otherwise, return the default image (home page background)
  return defaultImage
}

// Helper function to get data from global storage
function getData(key) {
  if (typeof window !== "undefined" && window.appData) {
    return window.appData[key]
  }
  return null
}

// Helper function to set data in global storage
function setData(key, value) {
  if (typeof window !== "undefined") {
    if (!window.appData) {
      window.appData = {}
    }
    window.appData[key] = value
  }
}

// Helper function to store a file and get a persistent URL
async function storeFile(file, path) {
  try {
    // Get the storage service
    const storageService = await createStorageService()

    // Upload the file and get the URL
    const url = await storageService.uploadFile(file, path)

    return url
  } catch (error) {
    console.error("Error storing file:", error)
    // Fallback for errors
    return `/placeholder.svg?height=600&width=600&query=Error+storing+file`
  }
}

// API functions
export async function fetchHomeContent() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getData("homeData")
}

export async function fetchAboutContent() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const aboutData = getData("aboutData")
  const homeData = getData("homeData")

  // Use home background as default if about doesn't have one
  if (aboutData && homeData) {
    aboutData.backgroundImage = getBackgroundImage(aboutData, homeData.backgroundImage)
    aboutData.useDefaultBackground = aboutData.backgroundImage === homeData.backgroundImage
  }

  return aboutData
}

export async function fetchGalleryContent() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const galleryData = getData("galleryData")
  const homeData = getData("homeData")

  // Use home background as default if gallery doesn't have one
  if (galleryData && homeData) {
    galleryData.backgroundImage = getBackgroundImage(galleryData, homeData.backgroundImage)
    galleryData.useDefaultBackground = galleryData.backgroundImage === homeData.backgroundImage
  }

  return galleryData
}

export async function fetchServicesContent() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const servicesData = getData("servicesData")
  const homeData = getData("homeData")

  // Use home background as default if services doesn't have one
  if (servicesData && homeData) {
    servicesData.backgroundImage = getBackgroundImage(servicesData, homeData.backgroundImage)
    servicesData.useDefaultBackground = servicesData.backgroundImage === homeData.backgroundImage
  }

  return servicesData
}

export async function fetchContactContent() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const contactData = getData("contactData")
  const homeData = getData("homeData")

  // Use home background as default if contact doesn't have one
  if (contactData && homeData) {
    contactData.backgroundImage = getBackgroundImage(contactData, homeData.backgroundImage)
    contactData.useDefaultBackground = contactData.backgroundImage === homeData.backgroundImage
  }

  return contactData
}

// Update the updateHomeContent function to store the artist name
export async function updateHomeContent(data) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Store the artist name for bucket name generation
  if (data.artistName) {
    const { storeArtistName } = await import("./storage/bucket-utils")
    storeArtistName(data.artistName)
  }

  // Update the global homeData object
  setData("homeData", { ...data })

  return { success: true }
}

export async function updateAboutContent(data) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Update the global aboutData object
  setData("aboutData", { ...data })

  return { success: true }
}

export async function uploadMedia(data) {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate a unique ID for the media item
  const id = Date.now().toString()

  // Determine the appropriate path in our storage structure
  let path = ""
  if (data.type === "photo") {
    path = `images/gallery/${data.category || "performances"}/${id}`
  } else {
    path = `videos/${data.category || "performances"}/${id}`
  }

  // If we have a file, store it
  let url = data.url
  if (data.file) {
    url = await storeFile(data.file, path)
  }

  // Create the new media item
  const newMedia = {
    id,
    type: data.type,
    url:
      url || (data.type === "photo" ? "/placeholder.svg?height=600&width=600" : "https://example.com/sample-video.mp4"),
    thumbnail: data.type === "video" ? "/placeholder.svg?height=600&width=600" : undefined,
    year: data.year,
    description: data.description,
    location: data.location,
  }

  // Add to the global galleryData
  const galleryData = getData("galleryData")
  galleryData.media.unshift(newMedia)
  setData("galleryData", galleryData)

  return { success: true, media: newMedia }
}

export async function deleteMedia(id) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Get the media item to delete
  const galleryData = getData("galleryData")
  const mediaItem = galleryData.media.find((item) => item.id === id)

  if (mediaItem && mediaItem.url) {
    try {
      // Extract the path from the URL if it's a stored file
      // This is a simplified approach - in production you'd need more robust path extraction
      const storageService = await createStorageService()

      // Only try to delete if it's not a placeholder
      if (!mediaItem.url.includes("placeholder.svg")) {
        // For S3 URLs, extract the path
        let path = mediaItem.url
        if (mediaItem.url.includes("amazonaws.com")) {
          // Extract the path from S3 URL
          const urlParts = mediaItem.url.split(".com/")
          if (urlParts.length > 1) {
            path = urlParts[1]
          }
        }

        await storageService.deleteFile(path)
      }
    } catch (error) {
      console.error("Error deleting media file:", error)
      // Continue with deletion from the gallery data even if file deletion fails
    }
  }

  // Update the global galleryData
  galleryData.media = galleryData.media.filter((item) => item.id !== id)
  setData("galleryData", galleryData)

  return { success: true }
}

export async function submitContactForm(data) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // In a real app, this would send an email or store in a database
  console.log("Contact form submitted:", data)
  return { success: true }
}

// New function to handle file uploads
export async function uploadFile(file) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Generate a unique path for the file
  const filename = file.name || "file"
  const timestamp = Date.now()
  const path = `uploads/${timestamp}_${filename}`

  // Store the file using our storage service
  const url = await storeFile(file, path)

  return { success: true, url }
}

// New function to update gallery background
export async function updateGalleryBackground(imageUrl) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Update the global galleryData
  const galleryData = getData("galleryData")
  galleryData.backgroundImage = imageUrl
  setData("galleryData", galleryData)

  return { success: true }
}
