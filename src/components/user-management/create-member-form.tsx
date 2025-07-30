"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { userService } from "@/lib/api/users"

interface CreateMemberFormProps {
  onSuccess: () => void
}

export function CreateMemberForm({ onSuccess }: CreateMemberFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newMember = await userService.createAdmin(formData)
      if (newMember) {
        toast({
          title: "Team member created",
          description: "The new team member has been created successfully.",
        })
        setFormData({ name: "", email: "", password: "" })
        onSuccess()
      } else {
        throw new Error("Failed to create team member")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team member. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to create member:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Create New Team Member</CardTitle>
        <CardDescription className="text-slate-500">
          Add a new member to your team with specific access levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="font-medium text-slate-700">Full Name</div>
              <Input
                id="name"
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
                id="email"
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
              <div className="font-medium text-slate-700">Password</div>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
                disabled={isLoading}
                className="border-slate-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Team Member
              </>
            )}
          </Button>
          <p className="text-sm text-slate-500 text-center mt-2">
            After creation, you can set specific access levels for this team member.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
