"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { checkAdminAuth, logoutAdmin } from "@/lib/auth"
import {
  fetchHomeContent,
  fetchAboutContent,
  fetchGalleryContent,
  updateHomeContent,
  updateAboutContent,
  uploadMedia,
  deleteMedia,
  uploadFile,
  updateGalleryBackground,
} from "@/lib/api"
import { Loader2, LogOut, Upload, Trash2, Home } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Markdown } from "@/components/markdown"
import DragDropUpload from "@/components/drag-drop-upload"

export default function AdminDashboard() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [homeContent, setHomeContent] = useState({
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
  })
  const [aboutContent, setAboutContent] = useState({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    content: {
      en: "# About Me\n\nI am a passionate musician with years of experience...",
      es: "# Bio\n\nSoy un músico apasionado con años de experiencia...",
    },
  })
  const [galleryContent, setGalleryContent] = useState({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    media: [],
  })

  // Form states
  const [homeForm, setHomeForm] = useState({
    backgroundImage: "",
    profileImage: "",
    artistName: "",
    navbarTitleEn: "",
    navbarTitleEs: "",
    introTextEn: "",
    introTextEs: "",
  })
  const [aboutForm, setAboutForm] = useState({
    backgroundImage: "",
    contentEn: "",
    contentEs: "",
  })
  const [newMediaForm, setNewMediaForm] = useState({
    type: "photo",
    file: null as File | null,
    yearCreated: new Date().getFullYear().toString(),
    descriptionEn: "",
    descriptionEs: "",
    location: "",
  })
  const [uploadingMedia, setUploadingMedia] = useState(false)

  // File upload states
  const [homeBackgroundFile, setHomeBackgroundFile] = useState<File | null>(null)
  const [homeProfileFile, setHomeProfileFile] = useState<File | null>(null)
  const [aboutBackgroundFile, setAboutBackgroundFile] = useState<File | null>(null)
  const [galleryBackgroundFile, setGalleryBackgroundFile] = useState<File | null>(null)

  // Loading states
  const [savingHome, setSavingHome] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const [savingGalleryBackground, setSavingGalleryBackground] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await checkAdminAuth()
        if (!isAuth) {
          router.push("/admin/login")
          return
        }

        // Fetch content
        const home = await fetchHomeContent()
        const about = await fetchAboutContent()
        const gallery = await fetchGalleryContent()

        if (home) {
          setHomeContent(home)
          setHomeForm({
            backgroundImage: home.backgroundImage,
            profileImage: home.profileImage,
            artistName: home.artistName || "Musician Portfolio",
            navbarTitleEn: home.navbarTitle?.en || "Musician",
            navbarTitleEs: home.navbarTitle?.es || "Músico",
            introTextEn: home.introText.en,
            introTextEs: home.introText.es,
          })
        }

        if (about) {
          setAboutContent(about)
          setAboutForm({
            backgroundImage: about.backgroundImage,
            contentEn: about.content.en,
            contentEs: about.content.es,
          })
        }

        if (gallery) {
          setGalleryContent(gallery)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      router.push("/admin/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleHomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingHome(true)

    try {
      let backgroundImageUrl = homeForm.backgroundImage
      let profileImageUrl = homeForm.profileImage

      // Upload background image if a new one was selected
      if (homeBackgroundFile) {
        const result = await uploadFile(homeBackgroundFile)
        if (result.success) {
          backgroundImageUrl = result.url
        }
      }

      // Upload profile image if a new one was selected
      if (homeProfileFile) {
        const result = await uploadFile(homeProfileFile)
        if (result.success) {
          profileImageUrl = result.url
        }
      }

      // Update the content with the new URLs
      const updatedContent = {
        backgroundImage: backgroundImageUrl,
        profileImage: profileImageUrl,
        artistName: homeForm.artistName,
        navbarTitle: {
          en: homeForm.navbarTitleEn,
          es: homeForm.navbarTitleEs,
        },
        introText: {
          en: homeForm.introTextEn,
          es: homeForm.introTextEs,
        },
      }

      // Save to the API
      await updateHomeContent(updatedContent)

      // Update local state
      setHomeContent(updatedContent)
      setHomeForm({
        ...homeForm,
        backgroundImage: backgroundImageUrl,
        profileImage: profileImageUrl,
      })

      // Reset file states
      setHomeBackgroundFile(null)
      setHomeProfileFile(null)

      toast({
        title: "Success",
        description: "Home content updated successfully! You can now view the changes on the home page.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update home content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingHome(false)
    }
  }

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAbout(true)

    try {
      let backgroundImageUrl = aboutForm.backgroundImage

      // Upload background image if a new one was selected
      if (aboutBackgroundFile) {
        const result = await uploadFile(aboutBackgroundFile)
        if (result.success) {
          backgroundImageUrl = result.url
        }
      }

      // Update the content with the new URL
      const updatedContent = {
        backgroundImage: backgroundImageUrl,
        content: {
          en: aboutForm.contentEn,
          es: aboutForm.contentEs,
        },
      }

      // Save to the API
      await updateAboutContent(updatedContent)

      // Update local state
      setAboutContent(updatedContent)
      setAboutForm({
        ...aboutForm,
        backgroundImage: backgroundImageUrl,
      })

      // Reset file state
      setAboutBackgroundFile(null)

      toast({
        title: "Success",
        description: "About content updated successfully! You can now view the changes on the about page.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update about content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingAbout(false)
    }
  }

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMediaForm.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingMedia(true)

      // First upload the file
      const fileResult = await uploadFile(newMediaForm.file)

      if (!fileResult.success) {
        throw new Error("Failed to upload file")
      }

      // Then create the media item with the file URL
      await uploadMedia({
        file: newMediaForm.file,
        type: newMediaForm.type,
        year: newMediaForm.yearCreated,
        description: {
          en: newMediaForm.descriptionEn,
          es: newMediaForm.descriptionEs,
        },
        location: newMediaForm.location,
        url: fileResult.url,
      })

      // Refresh gallery content
      const gallery = await fetchGalleryContent()
      if (gallery) {
        setGalleryContent(gallery)
      }

      // Reset form
      setNewMediaForm({
        type: "photo",
        file: null,
        yearCreated: new Date().getFullYear().toString(),
        descriptionEn: "",
        descriptionEs: "",
        location: "",
      })

      toast({
        title: "Success",
        description: "Media uploaded successfully! You can now view it in the gallery.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    try {
      await deleteMedia(id)

      // Refresh gallery content
      const gallery = await fetchGalleryContent()
      if (gallery) {
        setGalleryContent(gallery)
      }

      toast({
        title: "Success",
        description: "Media deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGalleryBackgroundUpdate = async (file: File) => {
    try {
      setSavingGalleryBackground(true)
      setGalleryBackgroundFile(file)

      // Upload the file
      const result = await uploadFile(file)

      if (result.success) {
        // Update the gallery background
        await updateGalleryBackground(result.url)

        // Update local state
        setGalleryContent({
          ...galleryContent,
          backgroundImage: result.url,
        })

        toast({
          title: "Success",
          description: "Gallery background updated successfully!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update gallery background. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingGalleryBackground(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-purple-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {t("admin.dashboard")}
          </h1>

          <div className="flex items-center space-x-4">
            <Link href="/" passHref>
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("admin.logout")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="home">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Home Content</CardTitle>
                  <CardDescription>Update the content displayed on the home page</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleHomeSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Background Image (Default for all pages)</Label>
                      <DragDropUpload
                        onFileDrop={(file) => setHomeBackgroundFile(file)}
                        accept="image/*"
                        previewUrl={homeForm.backgroundImage}
                        label="Drop background image here"
                        description="PNG, JPG or WebP up to 10MB. This image will be used as the default for all pages."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Profile Image</Label>
                      <DragDropUpload
                        onFileDrop={(file) => setHomeProfileFile(file)}
                        accept="image/*"
                        previewUrl={homeForm.profileImage}
                        label="Drop profile image here"
                        description="PNG, JPG or WebP up to 5MB"
                        height="h-48"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="navbarTitleEn">Navbar Title (English)</Label>
                      <Input
                        id="navbarTitleEn"
                        value={homeForm.navbarTitleEn}
                        onChange={(e) => setHomeForm({ ...homeForm, navbarTitleEn: e.target.value })}
                        placeholder="Musician"
                      />
                      <p className="text-xs text-muted-foreground">
                        This is the text displayed in the top-left corner of the navigation bar (English).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="navbarTitleEs">Navbar Title (Spanish)</Label>
                      <Input
                        id="navbarTitleEs"
                        value={homeForm.navbarTitleEs}
                        onChange={(e) => setHomeForm({ ...homeForm, navbarTitleEs: e.target.value })}
                        placeholder="Músico"
                      />
                      <p className="text-xs text-muted-foreground">
                        This is the text displayed in the top-left corner of the navigation bar (Spanish).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="artistName">Artist Name</Label>
                      <Input
                        id="artistName"
                        value={homeForm.artistName}
                        onChange={(e) => setHomeForm({ ...homeForm, artistName: e.target.value })}
                        placeholder="Musician Portfolio"
                      />
                      <p className="text-xs text-muted-foreground">
                        This is the main heading displayed below the profile image.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="introTextEn">Intro Text (English)</Label>
                      <Textarea
                        id="introTextEn"
                        value={homeForm.introTextEn}
                        onChange={(e) => setHomeForm({ ...homeForm, introTextEn: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="introTextEs">Intro Text (Spanish)</Label>
                      <Textarea
                        id="introTextEs"
                        value={homeForm.introTextEs}
                        onChange={(e) => setHomeForm({ ...homeForm, introTextEs: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full" disabled={savingHome}>
                        {savingHome ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>

                      {!savingHome && (
                        <Link href="/" passHref className="w-full">
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                            <Home className="h-4 w-4" />
                            <span>View Home Page</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Preview of the home page content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Background Image:</h3>
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={homeBackgroundFile ? URL.createObjectURL(homeBackgroundFile) : homeForm.backgroundImage}
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Profile Image:</h3>
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary">
                        <img
                          src={homeProfileFile ? URL.createObjectURL(homeProfileFile) : homeForm.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Navbar Title (English):</h3>
                      <div className="p-3 bg-muted rounded-md">
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                          {homeForm.navbarTitleEn}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Navbar Title (Spanish):</h3>
                      <div className="p-3 bg-muted rounded-md">
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                          {homeForm.navbarTitleEs}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Artist Name:</h3>
                      <div className="p-3 bg-muted rounded-md">
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                          {homeForm.artistName}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Intro Text (English):</h3>
                      <p className="p-3 bg-muted rounded-md">{homeForm.introTextEn}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Intro Text (Spanish):</h3>
                      <p className="p-3 bg-muted rounded-md">{homeForm.introTextEs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Edit About Content</CardTitle>
                  <CardDescription>Update the content displayed on the about page</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAboutSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Background Image (Optional)</Label>
                      <DragDropUpload
                        onFileDrop={(file) => setAboutBackgroundFile(file)}
                        accept="image/*"
                        previewUrl={aboutForm.backgroundImage}
                        label="Drop background image here"
                        description="Optional: If not set, the home page background will be used with blur effect."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contentEn">Content (English)</Label>
                      <Textarea
                        id="contentEn"
                        value={aboutForm.contentEn}
                        onChange={(e) => setAboutForm({ ...aboutForm, contentEn: e.target.value })}
                        rows={8}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contentEs">Content (Spanish)</Label>
                      <Textarea
                        id="contentEs"
                        value={aboutForm.contentEs}
                        onChange={(e) => setAboutForm({ ...aboutForm, contentEs: e.target.value })}
                        rows={8}
                      />
                    </div>

                    <div className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full" disabled={savingAbout}>
                        {savingAbout ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>

                      {!savingAbout && (
                        <Link href="/about" passHref className="w-full">
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                            <Home className="h-4 w-4" />
                            <span>View About Page</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Preview of the about page content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Background Image:</h3>
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={
                            aboutBackgroundFile ? URL.createObjectURL(aboutBackgroundFile) : aboutForm.backgroundImage
                          }
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Content Preview (English):</h3>
                      <div className="p-3 bg-muted rounded-md max-h-[300px] overflow-auto">
                        <Markdown content={aboutForm.contentEn} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Content Preview (Spanish):</h3>
                      <div className="p-3 bg-muted rounded-md max-h-[300px] overflow-auto">
                        <Markdown content={aboutForm.contentEs} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Upload New Media</CardTitle>
                  <CardDescription>Add new photos or videos to the gallery</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMediaUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mediaType">Media Type</Label>
                      <select
                        id="mediaType"
                        value={newMediaForm.type}
                        onChange={(e) =>
                          setNewMediaForm({ ...newMediaForm, type: e.target.value as "photo" | "video" })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Media File</Label>
                      <DragDropUpload
                        onFileDrop={(file) => setNewMediaForm({ ...newMediaForm, file })}
                        accept={newMediaForm.type === "photo" ? "image/*" : "video/*"}
                        label={`Drop ${newMediaForm.type} here`}
                        description={
                          newMediaForm.type === "photo" ? "PNG, JPG or WebP up to 10MB" : "MP4, WebM or OGG up to 50MB"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearCreated">Year</Label>
                      <Input
                        id="yearCreated"
                        value={newMediaForm.yearCreated}
                        onChange={(e) => setNewMediaForm({ ...newMediaForm, yearCreated: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionEn">Description (English)</Label>
                      <Textarea
                        id="descriptionEn"
                        value={newMediaForm.descriptionEn}
                        onChange={(e) => setNewMediaForm({ ...newMediaForm, descriptionEn: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionEs">Description (Spanish)</Label>
                      <Textarea
                        id="descriptionEs"
                        value={newMediaForm.descriptionEs}
                        onChange={(e) => setNewMediaForm({ ...newMediaForm, descriptionEs: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newMediaForm.location}
                        onChange={(e) => setNewMediaForm({ ...newMediaForm, location: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col space-y-4">
                      <Button type="submit" className="w-full" disabled={uploadingMedia}>
                        {uploadingMedia ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Media
                          </>
                        )}
                      </Button>

                      {!uploadingMedia && (
                        <Link href="/gallery" passHref className="w-full">
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                            <Home className="h-4 w-4" />
                            <span>View Gallery Page</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Manage Gallery</CardTitle>
                  <CardDescription>View and manage existing media</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Background Image (Optional)</Label>
                      <DragDropUpload
                        onFileDrop={handleGalleryBackgroundUpdate}
                        accept="image/*"
                        previewUrl={galleryContent.backgroundImage}
                        label="Drop gallery background image here"
                        description="Optional: If not set, the home page background will be used with blur effect."
                      />
                      {savingGalleryBackground && (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm">Saving background...</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Media Items</h3>

                      {galleryContent.media.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No media items yet. Upload some using the form.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {galleryContent.media.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden">
                              <div className="aspect-square bg-muted">
                                {item.type === "video" ? (
                                  <video src={item.url} className="w-full h-full object-cover" controls />
                                ) : (
                                  <img
                                    src={item.url || "/placeholder.svg"}
                                    alt={item.description.en}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium truncate">{item.description.en}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.year} • {item.location}
                                    </p>
                                  </div>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive" size="icon" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Confirm Deletion</DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete this media item? This action cannot be undone.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => {}}>
                                          Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleDeleteMedia(item.id)}>
                                          Delete
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
