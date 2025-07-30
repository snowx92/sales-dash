"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Search, UserCog, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Admin } from "@/lib/api/users/types"
import { userService } from "@/lib/api/users"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface TeamMembersListProps {
  onSelectMember: (member: Admin) => void;
  isLoadingDetails?: boolean;
}

export function TeamMembersList({ onSelectMember, isLoadingDetails = false }: TeamMembersListProps) {
  const [members, setMembers] = useState<Admin[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize] = useState(10) // Number of items per page
  const { toast } = useToast()

  useEffect(() => {
    loadMembers(currentPage)
  }, [currentPage])

  const loadMembers = async (page: number) => {
    setLoading(true)
    try {
      const response = await userService.getTeamMembers({ 
        pageNo: page, 
        limit: pageSize 
      })
      
      if (response) {
        setMembers(response.items)
        setTotalPages(response.totalPages)
        setTotalItems(response.totalItems)
      } else {
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to load members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue)
    setCurrentPage(1) // Reset to first page on search
    
    // You could implement server-side search here by modifying the loadMembers call
    // For now we're doing client-side filtering
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRandomColor = (id: string) => {
    const colors = [
      "bg-purple-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-amber-500",
      "bg-emerald-500",
      "bg-cyan-500",
      "bg-rose-500",
    ]
    const index = id.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Team Members</CardTitle>
            <CardDescription className="text-slate-500">
              Manage your team members and their access levels
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-9 border-slate-200 bg-slate-50 focus:bg-white"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    No team members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className={`${getRandomColor(member.id)} text-white`}>
                          <AvatarImage src={member.profilePic} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 font-medium">
                        {member.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.isBanned ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                          Active
                        </Badge>
                      )}
                      {member.isOnline && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
                        >
                          Online
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectMember(member)}
                        disabled={isLoadingDetails}
                        className="hover:bg-purple-100 hover:text-purple-700"
                      >
                        {isLoadingDetails ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCog className="h-4 w-4" />
                        )}
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
        
        {!loading && members.length > 0 && (
          <p className="text-xs text-slate-500 text-center mt-4">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} team members
          </p>
        )}
      </CardContent>
    </Card>
  )
}
