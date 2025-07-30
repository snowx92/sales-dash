"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamMembersList } from "./team-members-list"
import { TeamMemberDetails } from "./team-member-details"
import { CreateMemberForm } from "./create-member-form"
import { UserPlus, Users, UserCog } from "lucide-react"
import type { Admin } from "@/lib/api/users/types"
import { userService } from "@/lib/api/users"
import { useToast } from "@/components/ui/use-toast"

export default function UserManagement() {
  const [selectedMember, setSelectedMember] = useState<Admin | null>(null)
  const [activeTab, setActiveTab] = useState("members")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const handleSelectMember = async (member: Admin) => {
    setIsLoading(true)
    try {
      // Fetch the full member details when selected
      const memberDetails = await userService.getAdminDetails(member.id)
      if (memberDetails) {
        setSelectedMember(memberDetails)
        setActiveTab("details")
      } else {
        toast({
          title: "Error",
          description: "Failed to load member details. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load member details. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to fetch member details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setActiveTab("members")
  }

  const handleMemberUpdated = (updatedMember: Admin) => {
    setSelectedMember(updatedMember)
    toast({
      title: "Success",
      description: "Team member information has been updated successfully.",
    })
  }

  const handleMemberDeleted = () => {
    setSelectedMember(null)
    setActiveTab("members")
    toast({
      title: "Member Deleted",
      description: "The team member has been deleted successfully.",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Team Management
        </h1>
        <p className="text-slate-600 text-lg">Manage your team members and their access levels</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-slate-100/80 p-1 rounded-xl">
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg"
          >
            <Users className="h-4 w-4 mr-2" />
            Team Members
          </TabsTrigger>
          <TabsTrigger
            value="details"
            disabled={!selectedMember || isLoading}
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg"
          >
            <UserCog className="h-4 w-4 mr-2" />
            Member Details
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Member
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <TeamMembersList 
            onSelectMember={handleSelectMember} 
            isLoadingDetails={isLoading}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          {selectedMember && (
            <TeamMemberDetails 
              member={selectedMember} 
              onMemberUpdated={handleMemberUpdated}
              onMemberDeleted={handleMemberDeleted}
              onBackClick={() => setActiveTab("members")}
            />
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateMemberForm onSuccess={handleCreateSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
