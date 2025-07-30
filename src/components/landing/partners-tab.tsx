"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Plus, Edit, Trash2, Users, Building, Globe, Loader2 } from "lucide-react"
import { LandingPartnerService, LandingPartner, CreatePartnerRequest, UpdatePartnerRequest } from "@/lib/api/landing"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"



export function PartnersTab() {
  const [partners, setPartners] = useState<LandingPartner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<LandingPartner | null>(null)

  // Form states
  const [newPartner, setNewPartner] = useState<CreatePartnerRequest>({
    name: "",
    url: "",
    image: ""
  })
  const [editPartner, setEditPartner] = useState<UpdatePartnerRequest>({
    name: "",
    url: "",
    image: ""
  })

  const { toast } = useToast()
  const partnerService = LandingPartnerService.getInstance()

  const fetchPartners = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedPartners = await partnerService.getPartners()
      setPartners(fetchedPartners)
    } catch (error) {
      console.error("Error fetching partners:", error)
      toast({
        title: "Error",
        description: "Failed to fetch partners. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [partnerService, toast])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        if (isEdit) {
          setEditPartner(prev => ({ ...prev, image: base64 }))
        } else {
          setNewPartner(prev => ({ ...prev, image: base64 }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePartner = async () => {
    if (!newPartner.name || !newPartner.url || !newPartner.image) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload a logo.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)
      await partnerService.createPartner(newPartner)
      toast({
        title: "Success",
        description: "Partner added successfully!"
      })
      setNewPartner({
        name: "",
        url: "",
        image: ""
      })
      // Reset file input
      const fileInput = document.getElementById('partner-logo') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      await fetchPartners()
    } catch (error) {
      console.error("Error creating partner:", error)
      toast({
        title: "Error",
        description: "Failed to add partner. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditPartner = (partner: LandingPartner) => {
    setSelectedPartner(partner)
    setEditPartner({
      name: partner.name,
      url: partner.url,
      image: partner.image
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdatePartner = async () => {
    if (!selectedPartner || !editPartner.name || !editPartner.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUpdating(true)
      await partnerService.updatePartner(selectedPartner.id, editPartner)
      toast({
        title: "Success",
        description: "Partner updated successfully!"
      })
      setIsEditDialogOpen(false)
      await fetchPartners()
    } catch (error) {
      console.error("Error updating partner:", error)
      toast({
        title: "Error",
        description: "Failed to update partner. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeletePartner = async (id: string) => {
    try {
      setIsDeleting(id)
      await partnerService.deletePartner(id)
      toast({
        title: "Success",
        description: "Partner deleted successfully!"
      })
      await fetchPartners()
    } catch (error) {
      console.error("Error deleting partner:", error)
      toast({
        title: "Error",
        description: "Failed to delete partner. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Partner Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Add New Partner</span>
            </CardTitle>
            <CardDescription className="text-teal-100">Add a new partner to your network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="partner-name">Partner Name</Label>
              <Input
                id="partner-name"
                placeholder="Enter partner name"
                className="border-teal-200 focus:border-teal-500"
                value={newPartner.name}
                onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-website">Website URL</Label>
              <Input
                id="partner-website"
                placeholder="https://partner.com"
                className="border-teal-200 focus:border-teal-500"
                value={newPartner.url}
                onChange={(e) => setNewPartner(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-logo">Partner Logo</Label>
              <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                <input
                  id="partner-logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e)}
                />
                <label htmlFor="partner-logo" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-teal-400" />
                <p className="mt-2 text-sm text-gray-600">Upload partner logo</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>
              {newPartner.image && (
                <div className="mt-2">
                  <Image src={newPartner.image} alt="Logo Preview" width={120} height={80} className="w-20 h-12 mx-auto object-contain rounded-lg" />
                </div>
              )}
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
              onClick={handleCreatePartner}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Partners */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-teal-600 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Current Partners</span>
            </CardTitle>
            <CardDescription>Manage your partner network</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">Loading partners...</span>
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No partners yet</p>
                <p className="text-sm">Add your first partner to get started</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="border border-teal-100 rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                >
                    <Image
                      src={partner.image || "/placeholder.svg"}
                    alt={partner.name}
                      width={120}
                      height={80}
                    className="w-20 h-12 object-contain mx-auto mb-3"
                  />
                  <h4 className="font-medium mb-2 truncate">{partner.name}</h4>
                  <a
                      href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:underline flex items-center justify-center mb-3 truncate"
                  >
                    <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Visit Website</span>
                  </a>
                  <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 hover:bg-teal-50"
                        onClick={() => handleEditPartner(partner)}
                      >
                      <Edit className="w-4 h-4" />
                    </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeletePartner(partner.id)}
                        disabled={isDeleting === partner.id}
                      >
                        {isDeleting === partner.id ? (
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



      {/* Edit Partner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-teal-600">Edit Partner</DialogTitle>
            <DialogDescription>Update partner details</DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-partner-name">Partner Name</Label>
                <Input 
                  id="edit-partner-name" 
                  value={editPartner.name}
                  onChange={(e) => setEditPartner(prev => ({ ...prev, name: e.target.value }))}
                />
                    </div>
              <div className="space-y-2">
                <Label htmlFor="edit-partner-url">Website URL</Label>
                <Input 
                  id="edit-partner-url" 
                  value={editPartner.url}
                  onChange={(e) => setEditPartner(prev => ({ ...prev, url: e.target.value }))}
                />
                  </div>
              <div className="space-y-2">
                <Label>Current Logo</Label>
                <Image
                  src={editPartner.image || "/placeholder.svg"}
                  alt="Current Logo"
                  width={120}
                  height={80}
                  className="w-20 h-12 object-contain rounded-lg"
                />
                  </div>
              <div className="space-y-2">
                <Label>Replace Logo (Optional)</Label>
                <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                  <input
                    id="edit-partner-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, true)}
                  />
                  <label htmlFor="edit-partner-logo" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-teal-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload new logo</p>
                  </label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
                  onClick={handleUpdatePartner}
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
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
