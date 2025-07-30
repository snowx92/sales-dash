"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Plus, Edit, Trash2, ExternalLink, Star, Loader2 } from "lucide-react"
import { LandingReviewService, LandingReview, CreateReviewRequest, UpdateReviewRequest } from "@/lib/api/landing"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export function ReviewsTab() {
  const [reviews, setReviews] = useState<LandingReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false)
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<LandingReview | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Form states
  const [newReview, setNewReview] = useState<CreateReviewRequest>({
    name: "",
    storeName: "",
    storeWebsite: "",
    logo: "",
    review: "",
    rating: 5
  })
  const [editReview, setEditReview] = useState<UpdateReviewRequest>({
    name: "",
    storeName: "",
    storeWebsite: "",
    logo: "",
    review: "",
    rating: 5
  })

  const { toast } = useToast()
  const reviewService = LandingReviewService.getInstance()

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedReviews = await reviewService.getReviews()
      setReviews(fetchedReviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [reviewService, toast])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        if (isEdit) {
          setEditReview(prev => ({ ...prev, logo: base64 }))
        } else {
          setNewReview(prev => ({ ...prev, logo: base64 }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateReview = async () => {
    if (!newReview.name || !newReview.storeName || !newReview.storeWebsite || !newReview.review || !newReview.logo) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload a logo.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)
      await reviewService.createReview(newReview)
      toast({
        title: "Success",
        description: "Review added successfully!"
      })
      setNewReview({
        name: "",
        storeName: "",
        storeWebsite: "",
        logo: "",
        review: "",
        rating: 5
      })
      setIsAddReviewOpen(false)
      await fetchReviews()
    } catch (error) {
      console.error("Error creating review:", error)
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditReview = (review: LandingReview) => {
    setSelectedReview(review)
    setEditReview({
      name: review.name,
      storeName: review.storeName,
      storeWebsite: review.storeWebsite,
      logo: review.logo,
      review: review.review,
      rating: review.rating
    })
    setIsEditReviewOpen(true)
  }

  const handleUpdateReview = async () => {
    if (!selectedReview || !editReview.name || !editReview.storeName || !editReview.storeWebsite || !editReview.review) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUpdating(true)
      await reviewService.updateReview(selectedReview.id, editReview)
      toast({
        title: "Success",
        description: "Review updated successfully!"
      })
      setIsEditReviewOpen(false)
      await fetchReviews()
    } catch (error) {
      console.error("Error updating review:", error)
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteReview = async (id: string) => {
    try {
      setIsDeleting(id)
      await reviewService.deleteReview(id)
      toast({
        title: "Success",
        description: "Review deleted successfully!"
      })
      await fetchReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRatingClick = (rating: number, isEdit = false) => {
    if (isEdit) {
      setEditReview(prev => ({ ...prev, rating }))
    } else {
      setNewReview(prev => ({ ...prev, rating }))
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Customer Reviews
          </h2>
          <p className="text-gray-600 mt-1">Manage customer testimonials and feedback</p>
        </div>
        <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-orange-600">Add New Review</DialogTitle>
              <DialogDescription>Add a customer review and testimonial</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewer-name">Customer Name</Label>
                  <Input 
                    id="reviewer-name" 
                    placeholder="John Doe" 
                    value={newReview.name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input 
                    id="store-name" 
                    placeholder="Amazing Store" 
                    value={newReview.storeName}
                    onChange={(e) => setNewReview(prev => ({ ...prev, storeName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-website">Store Website</Label>
                <Input 
                  id="store-website" 
                  placeholder="https://amazingstore.com" 
                  value={newReview.storeWebsite}
                  onChange={(e) => setNewReview(prev => ({ ...prev, storeWebsite: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Store Logo</Label>
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e)}
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-orange-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload store logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                </div>
                {newReview.logo && (
                  <div className="mt-2">
                    <Image src={newReview.logo} alt="Logo Preview" width={100} height={100} className="w-20 h-20 mx-auto object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-2xl transition-colors ${star <= newReview.rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                      onClick={() => handleRatingClick(star)}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-text">Review Text</Label>
                <Textarea 
                  id="review-text" 
                  placeholder="Write the customer's review here..." 
                  rows={4} 
                  value={newReview.review}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  onClick={handleCreateReview}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Review"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsAddReviewOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm">Add your first customer review to get started</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="shadow-xl border-0 bg-white/80 backdrop-blur-lg hover:scale-105 transition-transform duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={review.logo || "/placeholder.svg"} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">{review.storeName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                    <h4 className="font-medium truncate">{review.name}</h4>
                    <div className="flex flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-orange-600 truncate">{review.storeName}</span>
                    <a
                      href={review.storeWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-orange-600 flex-shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                                         <p className="text-gray-700 text-sm mb-4 p-3 bg-gray-50 rounded-lg italic break-words">&ldquo;{review.review}&rdquo;</p>
                    {review.featured && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      </div>
                    )}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-orange-50"
                      onClick={() => handleEditReview(review)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={isDeleting === review.id}
                      >
                        {isDeleting === review.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                      <Trash2 className="w-4 h-4" />
                        )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={isEditReviewOpen} onOpenChange={setIsEditReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">Edit Review</DialogTitle>
            <DialogDescription>Update customer review details</DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-reviewer-name">Customer Name</Label>
                  <Input 
                    id="edit-reviewer-name" 
                    value={editReview.name}
                    onChange={(e) => setEditReview(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-store-name">Store Name</Label>
                  <Input 
                    id="edit-store-name" 
                    value={editReview.storeName}
                    onChange={(e) => setEditReview(prev => ({ ...prev, storeName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-store-website">Store Website</Label>
                <Input 
                  id="edit-store-website" 
                  value={editReview.storeWebsite}
                  onChange={(e) => setEditReview(prev => ({ ...prev, storeWebsite: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Logo</Label>
                <Image
                  src={editReview.logo || "/placeholder.svg"}
                  alt="Current Logo"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Replace Logo (Optional)</Label>
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    id="edit-logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, true)}
                  />
                  <label htmlFor="edit-logo-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-orange-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload new logo</p>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-2xl transition-colors ${star <= editReview.rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                      onClick={() => handleRatingClick(star, true)}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-review-text">Review Text</Label>
                <Textarea 
                  id="edit-review-text" 
                  value={editReview.review} 
                  rows={4} 
                  onChange={(e) => setEditReview(prev => ({ ...prev, review: e.target.value }))}
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  onClick={handleUpdateReview}
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
                <Button variant="outline" onClick={() => setIsEditReviewOpen(false)}>
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
