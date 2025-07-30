"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Edit, ExternalLink, Trash2, Camera, ImageIcon, Loader2 } from "lucide-react"
import { LandingBannerService, LandingBanner, CreateBannerRequest, UpdateBannerRequest } from "@/lib/api/landing"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export function MediaLinksTab() {
  const [banners, setBanners] = useState<LandingBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditPhotoOpen, setIsEditPhotoOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<LandingBanner | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Form states
  const [newBanner, setNewBanner] = useState<CreateBannerRequest>({
    title: "",
    link: "",
    image: ""
  })
  const [editBanner, setEditBanner] = useState<UpdateBannerRequest>({
    title: "",
    link: "",
    image: ""
  })

  const { toast } = useToast()
  const bannerService = LandingBannerService.getInstance()

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedBanners = await bannerService.getBanners()
      setBanners(fetchedBanners)
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: "Failed to fetch banners. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [bannerService, toast])

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        if (isEdit) {
          setEditBanner(prev => ({ ...prev, image: base64 }))
        } else {
          setNewBanner(prev => ({ ...prev, image: base64 }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateBanner = async () => {
    if (!newBanner.title || !newBanner.link || !newBanner.image) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload an image.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUploading(true)
      await bannerService.createBanner(newBanner)
      toast({
        title: "Success",
        description: "Banner uploaded successfully!"
      })
      setNewBanner({ title: "", link: "", image: "" })
      // Reset file input
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      await fetchBanners()
    } catch (error) {
      console.error("Error creating banner:", error)
      toast({
        title: "Error",
        description: "Failed to upload banner. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditPhoto = (photo: LandingBanner) => {
    setSelectedPhoto(photo)
    setEditBanner({
      title: photo.title,
      link: photo.link,
      image: photo.image
    })
    setIsEditPhotoOpen(true)
  }

  const handleUpdateBanner = async () => {
    if (!selectedPhoto || !editBanner.title || !editBanner.link) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUpdating(true)
      await bannerService.updateBanner(selectedPhoto.id, editBanner)
      toast({
        title: "Success",
        description: "Banner updated successfully!"
      })
      setIsEditPhotoOpen(false)
      await fetchBanners()
    } catch (error) {
      console.error("Error updating banner:", error)
      toast({
        title: "Error",
        description: "Failed to update banner. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    try {
      setIsDeleting(id)
      await bannerService.deleteBanner(id)
      toast({
        title: "Success",
        description: "Banner deleted successfully!"
      })
      await fetchBanners()
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader className="bg-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Upload Website Photo</span>
            </CardTitle>
            <CardDescription className="text-purple-100">Add new photos and links to your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="photo-title">Photo Title</Label>
              <Input
                id="photo-title"
                placeholder="Enter photo title"
                className="border-purple-200 focus:border-purple-500"
                value={newBanner.title}
                onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo-link">Website Link</Label>
              <Input
                id="photo-link"
                placeholder="https://example.com"
                className="border-purple-200 focus:border-purple-500"
                value={newBanner.link}
                onChange={(e) => setNewBanner(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo-upload">Upload Photo</Label>
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e)}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-purple-400" />
                <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>
              {newBanner.image && (
                <div className="mt-2">
                  <Image src={newBanner.image} alt="Preview" width={300} height={200} className="w-full max-w-xs mx-auto h-auto object-cover rounded-lg" />
                </div>
              )}
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={handleCreateBanner}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Photos */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-purple-600 flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Existing Photos</span>
            </CardTitle>
            <CardDescription>Manage your uploaded photos and links</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Loading banners...</span>
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No banners uploaded yet</p>
                <p className="text-sm">Upload your first banner to get started</p>
              </div>
            ) : (
            <div className="space-y-4">
                {banners.map((photo) => (
                <div
                  key={photo.id}
                  className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 border border-purple-100 rounded-xl hover:shadow-lg transition-shadow"
                >
                                         <Image
                       src={photo.image || "/placeholder.svg"}
                    alt={photo.title}
                       width={64}
                       height={64}
                    className="w-full sm:w-16 h-auto sm:h-16 max-h-32 sm:max-h-none object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                    <h4 className="font-medium truncate">{photo.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{photo.link}</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-purple-50"
                      onClick={() => handleEditPhoto(photo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="hover:bg-purple-50">
                      <a href={photo.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteBanner(photo.id)}
                        disabled={isDeleting === photo.id}
                      >
                        {isDeleting === photo.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                      <Trash2 className="w-4 h-4" />
                        )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Photo Dialog */}
      <Dialog open={isEditPhotoOpen} onOpenChange={setIsEditPhotoOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600">Edit Photo</DialogTitle>
            <DialogDescription>Update photo details and link</DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-photo-title">Photo Title</Label>
                <Input 
                  id="edit-photo-title" 
                  value={editBanner.title}
                  onChange={(e) => setEditBanner(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-photo-link">Website Link</Label>
                <Input 
                  id="edit-photo-link" 
                  value={editBanner.link}
                  onChange={(e) => setEditBanner(prev => ({ ...prev, link: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Photo</Label>
                <Image
                  src={editBanner.image || "/placeholder.svg"}
                  alt={editBanner.title}
                  width={300}
                  height={200}
                  className="w-full max-w-xs mx-auto h-auto object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Replace Photo (Optional)</Label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <input
                    id="edit-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, true)}
                  />
                  <label htmlFor="edit-photo-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-purple-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload new photo</p>
                  </label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleUpdateBanner}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsEditPhotoOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
