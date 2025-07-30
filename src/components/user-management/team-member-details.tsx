"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Admin, AdminLog } from "@/lib/api/users/types"
import { userService } from "@/lib/api/users"
import { AccessLevelForm } from "./access-level-form"
import { EditMemberForm } from "./edit-member-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, UserCog, Clock, AlertTriangle, ArrowLeft, Loader2, ClipboardX } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Pagination } from "@/components/ui/pagination"

interface TeamMemberDetailsProps {
  member: Admin;
  onMemberUpdated: (member: Admin) => void;
  onMemberDeleted: () => void;
  onBackClick: () => void;
}

export function TeamMemberDetails({ 
  member, 
  onMemberUpdated, 
  onMemberDeleted, 
  onBackClick 
}: TeamMemberDetailsProps) {
  const [currentMember, setCurrentMember] = useState<Admin>(member)
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [activeTab, setActiveTab] = useState("profile")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [logPage, setLogPage] = useState(1)
  const [totalLogPages, setTotalLogPages] = useState(1)
  const { toast } = useToast()

  // Load logs when tab changes to "logs" or log page changes
  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs()
    }
  }, [activeTab, logPage])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      // Check if currentMember exists and has an id
      if (!currentMember?.id) {
        toast({
          title: "Error",
          description: "Member data not available. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await userService.getMemberLogs(currentMember.id, { 
        pageNo: logPage, 
        limit: 10 
      })
      
      if (response) {
        setLogs(response.items)
        setTotalLogPages(response.totalPages)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load activity logs. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to load logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000)
    return date.toLocaleString()
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRandomColor = (id: string | undefined) => {
    const gradients = [
      "bg-gradient-to-br from-purple-500 to-pink-500",
      "bg-gradient-to-br from-indigo-500 to-cyan-400",
      "bg-gradient-to-br from-pink-500 to-rose-500",
      "bg-gradient-to-br from-teal-500 to-emerald-500",
      "bg-gradient-to-br from-amber-500 to-orange-500",
      "bg-gradient-to-br from-emerald-500 to-green-500",
      "bg-gradient-to-br from-cyan-500 to-blue-500",
      "bg-gradient-to-br from-rose-500 to-red-500",
    ]
    
    // Return a default gradient if id is undefined or empty
    if (!id || id.length === 0) {
      return gradients[0];
    }
    
    const index = id.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await userService.deleteAdmin(currentMember.id)
      setDeleteDialogOpen(false)
      onMemberDeleted()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to delete member:", error)
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleProfileUpdated = (updatedMember: Admin) => {
    setCurrentMember(updatedMember)
    onMemberUpdated(updatedMember)
  }

  const handleAccessLevelsUpdated = (updatedMember: Admin) => {
    setCurrentMember(updatedMember)
    onMemberUpdated(updatedMember)
  }

  return (
    <div className="space-y-6">
      {!currentMember ? (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-center items-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mb-4 mx-auto animate-spin text-slate-400" />
                <p className="text-slate-500">Loading member details...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className={`h-20 w-20 ${getRandomColor(currentMember?.id)} text-white`}>
                    <AvatarImage src={currentMember?.profilePic} />
                    <AvatarFallback className="text-2xl font-semibold">{getInitials(currentMember?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{currentMember?.name}</h2>
                    <p className="text-slate-500">{currentMember?.email}</p>
                    <div className="flex gap-2 mt-2">
                      {currentMember?.isBanned ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                          Active
                        </Badge>
                      )}
                      {currentMember?.isOnline && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                          Online
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">
                        {currentMember?.accountType || "Member"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    className="border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    onClick={onBackClick}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the account and remove all associated
                          data.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setDeleteDialogOpen(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Account'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100/80 p-1 rounded-xl">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg"
              >
                <UserCog className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="access"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg"
              >
                <Shield className="h-4 w-4 mr-2" />
                Access Levels
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg"
              >
                <Clock className="h-4 w-4 mr-2" />
                Activity Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                  <CardDescription className="text-slate-500">Update the team member&apos;s profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentMember && (
                    <EditMemberForm 
                      member={currentMember} 
                      onSuccess={handleProfileUpdated} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access" className="mt-6">
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Access Levels</CardTitle>
                  <CardDescription className="text-slate-500">
                    Manage what this team member can access and modify
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentMember && (
                    <AccessLevelForm 
                      member={currentMember} 
                      onSuccess={handleAccessLevelsUpdated} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Activity Logs</CardTitle>
                  <CardDescription className="text-slate-500">
                    View all actions performed by this team member
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : logs.length > 0 ? (
                    <>
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Action</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead>Date & Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {logs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.action || "N/A"}</TableCell>
                                <TableCell>{log.targetType || "N/A"}</TableCell>
                                <TableCell>{log.ip || "N/A"}</TableCell>
                                <TableCell>{log.createdAt ? formatDate(log.createdAt) : "N/A"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {totalLogPages > 1 && (
                        <div className="flex justify-center mt-4">
                          <Pagination
                            currentPage={logPage}
                            totalPages={totalLogPages}
                            onPageChange={(page) => setLogPage(page)}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <ClipboardX className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <p>No activity logs found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
