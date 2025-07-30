"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Admin, AccessLevels } from "@/lib/api/users/types"
import { userService } from "@/lib/api/users"
import { Switch } from "@/components/ui/switch"

interface AccessLevelFormProps {
  member: Admin;
  onSuccess: (updatedMember: Admin) => void;
}

export function AccessLevelForm({ member, onSuccess }: AccessLevelFormProps) {
  const [accessLevels, setAccessLevels] = useState<AccessLevels>(
    member?.accessLevels || {}
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!member?.id) {
        throw new Error("Invalid member data")
      }

      const updatedMember = await userService.updateAccessLevels(member.id, { 
        accessLevels 
      })
      
      if (updatedMember) {
        toast({
          title: "Access levels updated",
          description: "The team member's access levels have been updated successfully.",
        })
        onSuccess(updatedMember)
      } else {
        throw new Error("Failed to update access levels")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update access levels"
      toast({
        title: "Error",
        description: `${errorMessage}. Please try again.`,
        variant: "destructive",
      })
      console.error("Failed to update access levels:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePermission = (section: string, permission: string, value: boolean) => {
    if (!section || !permission) return;
    
    setAccessLevels((prev) => {
      // Use a safe copy of prev or an empty object if prev is undefined
      const safePrev = prev || {};
      
      // Create a safe copy of the section data
      const sectionKey = section as keyof AccessLevels;
      // Create a fresh copy of the section or an empty object if it doesn't exist
      const newSection = { ...(safePrev[sectionKey] || {}) };
      
      // Set the permission using bracket notation with appropriate type safety
      (newSection as Record<string, boolean>)[permission] = value;
      
      return {
        ...safePrev,
        [sectionKey]: newSection,
      };
    });
  }

  const permissionSections = [
    {
      name: "stores",
      label: "Stores",
      icon: "🏪",
      permissions: ["read", "update", "delete"],
    },
    {
      name: "vpay",
      label: "VPay",
      icon: "💳",
      permissions: ["read", "update"],
    },
    {
      name: "payouts",
      label: "Payouts",
      icon: "💰",
      permissions: ["read", "update"],
    },
    {
      name: "banners",
      label: "Banners",
      icon: "🖼️",
      permissions: ["read", "add", "update", "delete"],
    },
    {
      name: "team",
      label: "Team",
      icon: "👥",
      permissions: ["read", "add", "update", "delete"],
    },
    {
      name: "analytics",
      label: "Analytics",
      icon: "📊",
      permissions: ["read"],
    },
    {
      name: "sales",
      label: "Sales",
      icon: "💼",
      permissions: ["read", "add", "update", "delete"],
    },
    {
      name: "plugins",
      label: "Plugins",
      icon: "/placeholder.svg",
      permissions: ["read", "approve", "delete"],
    },
    {
      name: "blog",
      label: "Blog",
      icon: "📝",
      permissions: ["read", "add", "update", "delete"],
    },
    {
      name: "notifications",
      label: "Notifications",
      icon: "🔔",
      permissions: ["create"],
    },
    {
      name: "tips",
      label: "Tips",
      icon: "💡",
      permissions: ["read", "add", "update", "delete"],
    },
    {
      name: "discounts",
      label: "Discounts",
      icon: "🏷️",
      permissions: ["read", "add", "update", "delete"],
    },
    {
      name: "subscriptions",
      label: "Subscriptions",
      icon: "🔄",
      permissions: ["add", "discount"],
    },
  ]

  // Helper to check if a permission is enabled
  const isPermissionEnabled = (section: string, permission: string): boolean => {
    if (!section || !permission) return false
    
    const sectionKey = section as keyof AccessLevels
    // Safely access the section data
    const sectionData = accessLevels?.[sectionKey]
    if (!sectionData) return false
    
    // Safely access the permission
    return Boolean(sectionData[permission as keyof typeof sectionData])
  }

  // Get color for permission type
  const getPermissionColor = (permission: string): string => {
    switch (permission) {
      case "read":
        return "text-blue-600";
      case "update":
        return "text-orange-500";
      case "delete":
        return "text-red-600";
      case "add":
        return "text-green-600";
      case "create":
        return "text-green-600";
      case "approve":
        return "text-purple-600";
      case "discount":
        return "text-amber-500";
      default:
        return "text-slate-700";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Access Permissions</h2>
        <p className="text-sm text-slate-500">Configure what this team member can access and manage in the system.</p>
      </div>

      {!member ? (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md text-yellow-800">
          No member data available. Please try refreshing the page.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {permissionSections.map((section) => (
            <div key={section.name} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="font-medium text-lg flex items-center">
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {section.permissions.map((permission) => (
                  <div
                    key={`${section.name}-${permission}`}
                    className="flex items-center justify-between"
                  >
                    <span className={`capitalize ${getPermissionColor(permission)}`}>{permission}</span>
                    <Switch
                      checked={isPermissionEnabled(section.name, permission)}
                      onCheckedChange={(checked: boolean) => {
                        if (section.name && permission) {
                          togglePermission(section.name, permission, checked);
                        }
                      }}
                      disabled={isLoading}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || !member}
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
              Save Access Levels
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
