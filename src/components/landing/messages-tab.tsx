"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MessageSquare, Calendar, Mail, Phone, Trash2, Eye, Filter } from "lucide-react"
import { contactService, ContactMessage } from "@/lib/api/landing"
import { PaginatedResponse } from "@/lib/api/services/commonTypes"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"

export function MessagesTab() {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    isLastPage: true
  })
  const [statusFilter, setStatusFilter] = useState<'all' | 'opened' | 'closed'>('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null)
  const { toast } = useToast()

  // Fetch contact messages
  const fetchMessages = useCallback(async (page: number = 1, status?: 'opened' | 'closed') => {
    try {
      setLoading(true)
      const params = {
        pageNo: page,
        limit: 10,
        ...(status ? { status } : {})
      }
      
      const response: PaginatedResponse<ContactMessage> = await contactService.getContactMessages(params)
      
      setContactMessages(response.items)
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        isLastPage: response.isLastPage
      })
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Update message status
  const updateStatus = async (messageId: string, newStatus: 'opened' | 'closed') => {
    try {
      await contactService.updateContactStatus(messageId, { status: newStatus })
      
      // Update local state
      setContactMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: newStatus, updatedAt: { _seconds: Date.now() / 1000, _nanoseconds: 0 } }
            : msg
        )
      )
      
      toast({
        title: "Success",
        description: `Message marked as ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating message status:', error)
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      })
    }
  }

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      await contactService.deleteContactMessage(messageId)
      
      // Remove from local state
      setContactMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      toast({
        title: "Success",
        description: "Message deleted successfully",
      })
      
      setIsDeleteDialogOpen(false)
      setMessageToDelete(null)
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      })
    }
  }

  // Format date
  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    return new Date(timestamp._seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    const newStatus = value as 'all' | 'opened' | 'closed'
    setStatusFilter(newStatus)
    fetchMessages(1, newStatus === 'all' ? undefined : newStatus)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchMessages(page, statusFilter === 'all' ? undefined : statusFilter)
  }

  // Load messages on component mount
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Contact Form Messages</span>
        </CardTitle>
        <CardDescription className="text-green-100">
          Messages received from your contact form ({pagination.totalItems} total)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Filter Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by status:</span>
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
            <span>Loading messages...</span>
          </div>
        ) : contactMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No contact messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contactMessages.map((message) => (
              <div key={message.id} className="border border-purple-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {message.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{message.name}</h4>
                        <Badge variant={message.status === 'opened' ? 'default' : 'secondary'}>
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{message.email}</p>
                      {message.phone && (
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {message.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 whitespace-nowrap">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg break-words line-clamp-3">
                  {message.message}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMessage(message)
                      setIsViewDialogOpen(true)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  <a
                    href={`mailto:${message.email}?subject=Re: Contact Form Message&body=Hi ${message.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0ABest regards`}
                  >
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </a>
                  
                  <Select
                    value={message.status}
                    onValueChange={(value: 'opened' | 'closed') => updateStatus(message.id, value)}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setMessageToDelete(message)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && contactMessages.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>

      {/* View Message Dialog */}
      <AlertDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Contact Message Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={selectedMessage.status === 'opened' ? 'default' : 'secondary'}>
                    {selectedMessage.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p>{selectedMessage.phone || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p>{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message from {messageToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => messageToDelete && deleteMessage(messageToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
