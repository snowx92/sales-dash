"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/SideBar";
import DynamicNavbar from "@/components/layout/DynamicNavbar";
import { SessionManager } from "@/lib/utils/session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const sessionManager = SessionManager.getInstance();
      const token = sessionManager.getToken();
      console.log("🔐 DashboardLayout: Checking authentication, token:", token ? "EXISTS" : "NOT_FOUND");
      
      if (!token) {
        console.log("❌ DashboardLayout: No token found, redirecting to login");
        router.replace("/login");
        return;
      }
      
      console.log("✅ DashboardLayout: Token found, user authenticated");
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    // Add a small delay to ensure all auth processes are complete
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Main Content Area - with left margin that matches sidebar width */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'
        }`}
      >
        {/* Navbar */}
        <DynamicNavbar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 