"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Save, Loader2 } from "lucide-react"
import type { Admin } from "@/lib/api/users/types"
import { userService } from "@/lib/api/users"

interface EditMemberFormProps {
  member: Admin;
  onSuccess: (updatedMember: Admin) => void;
}

export function EditMemberForm({ member, onSuccess }: EditMemberFormProps) {
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    isBanned: member.isBanned,
    password: "", // Optional, only used if provided
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    const updateData = {
      name: formData.name,
      email: formData.email,
      isBanned: formData.isBanned,
    }
    
    // Only include password if it was entered
    if (formData.password) {
      Object.assign(updateData, { password: formData.password })
    }
    
    try {
      const updatedMember = await userService.updateAdmin(member.id, updateData)
      if (updatedMember) {
        toast({
          title: "Profile updated",
          description: "The team member's profile has been updated successfully.",
        })
        onSuccess(updatedMember)
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="font-medium text-slate-700">Full Name</div>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="John Smith"
            disabled={isLoading}
            className="border-slate-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        <div className="grid gap-2">
          <div className="font-medium text-slate-700">Email Address</div>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="john.smith@example.com"
            disabled={isLoading}
            className="border-slate-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>
        
        <div className="grid gap-2">
          <div className="font-medium text-slate-700">Password (leave blank to keep current)</div>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            disabled={isLoading}
            className="border-slate-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="font-medium text-slate-700">Account Status</div>
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant={formData.isBanned ? "outline" : "default"}
              size="sm"
              onClick={() => setFormData({ ...formData, isBanned: false })}
              disabled={isLoading}
            >
              Active
            </Button>
            <Button 
              type="button" 
              variant={formData.isBanned ? "destructive" : "outline"}
              size="sm"
              onClick={() => setFormData({ ...formData, isBanned: true })}
              disabled={isLoading}
            >
              Banned
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
