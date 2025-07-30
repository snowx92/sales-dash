import { Metadata } from "next";
import { PAGE_TITLES } from "@/lib/config/page-titles";

export const metadata: Metadata = {
  title: PAGE_TITLES.MERCHANTS,
  description: "Manage and view merchant accounts",
};

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MerchantsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the merchants list page
    router.replace("/dashboard/merchants/list")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to merchants...</p>
      </div>
    </div>
  )
} 