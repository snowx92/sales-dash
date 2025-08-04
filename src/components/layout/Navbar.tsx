"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/lib/api/auth/utils";
import { profileService, type UserProfile } from "@/lib/api/profile/profileService";
import { SessionManager } from "@/lib/utils/session";

// Add this mapping object for prettier labels
const routeLabels: { [key: string]: string } = {
  dashboard: "Dashboard",
  overview: "Overview",
  merchants: "Merchants",
  leads: "Leads", 
  retention: "Retention",
};

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }: NavbarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { label: string; href: string }[]
  >([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Add a small delay to ensure token is available after login
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log("🔍 Navbar: Fetching user profile...");
        
        // Check if we have a token before making the request
        const sessionManager = SessionManager.getInstance();
        const token = sessionManager.getToken();
        console.log("🔐 Navbar: Has token:", token ? "YES" : "NO");
        
        if (!token) {
          console.log("⚠️ Navbar: No token found, skipping profile fetch");
          return;
        }
        
        const response = await profileService.getProfile();
        console.log("📋 Navbar: Profile response:", response);
        
        if (response && response.status && response.data) {
          setUserProfile(response.data);
          console.log("✅ Navbar: Profile loaded successfully:", response.data);
        } else {
          console.log("❌ Navbar: Invalid profile response:", response);
        }
      } catch (error) {
        console.error("🚨 Navbar: Profile fetch error:", error);
        // Don't show error to user in navbar, just fallback to default
      }
    };

    fetchUserProfile();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Updated breadcrumbs generation for sales dashboard
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const paths = pathname.split("/").filter(Boolean);
      const items = paths
        .map((path, index) => {
          // Skip route groups
          if (path === "(auth)" || path === "(dashboard)") {
            return null;
          }

          // Special case for overview - return only Dashboard
          if (path === "overview") {
            return { label: "Overview", href: "/dashboard/overview" };
          }

          // Skip "dashboard" path as we'll handle it with overview
          if (path === "dashboard") {
            return null;
          }

          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
          return { label, href };
        })
        .filter((item): item is { label: string; href: string } => item !== null);

      // Add Dashboard at the beginning only if we're not already showing it
      if (items.length > 0 && items[0].label !== "Overview") {
        items.unshift({ label: "Overview", href: "/dashboard/overview" });
      }

      // Remove duplicates
      const uniqueItems = items.filter((item, index, self) =>
        index === self.findIndex((t) => t.label === item.label)
      );

      setBreadcrumbs(uniqueItems);
    };

    generateBreadcrumbs();
  }, [pathname]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside profile dropdown
      if (isProfileOpen) {
        const profileDropdown = document.querySelector('[data-profile-dropdown]');
        const profileButton = document.querySelector('[data-profile-button]');
        
        if (profileDropdown && profileButton) {
          if (!profileDropdown.contains(target) && !profileButton.contains(target)) {
            setIsProfileOpen(false);
          }
        }
      }
    };

    // Add event listener when dropdowns are open
    if (isProfileOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm relative z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Breadcrumbs - Shown on Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-600 mx-1" />
                )}
                <Link
                  href={breadcrumb.href}
                  className={`text-sm font-medium transition-colors ${
                    index === breadcrumbs.length - 1
                      ? "text-purple-600"
                      : "text-gray-500 hover:text-purple-600 hover:underline"
                  }`}
                >
                  {breadcrumb.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Search Bar - Responsive */}
          <div className="hidden md:flex items-center flex-1 px-4 lg:px-8">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Search everything..."
              />
            </div>
          </div>

          {/* Right section with notifications and profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Button */}
            <button className="md:hidden p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full text-gray-500 hover:text-purple-600 focus:outline-none relative transition-colors"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center space-x-2 focus:outline-none"
                data-profile-button
              >
                <div className="relative w-8 h-8 overflow-hidden rounded-full bg-purple-100 border border-purple-200 ring-2 ring-white">
                  {userProfile?.profilePic ? (
                    <Image 
                      src={userProfile.profilePic} 
                      alt={userProfile.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center ${userProfile?.profilePic ? 'hidden' : ''}`}>
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="hidden sm:flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {userProfile?.name || 'Sales User'}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </div>
              </motion.button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    data-profile-dropdown
                  >
                    <div className="py-1">
                      <Link href="/dashboard/profile">
                        <motion.div
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(128, 0, 128, 0.1)"
                          }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center px-3 py-3 rounded-lg text-gray-600 hover:text-purple-500 group transition-colors"
                        >
                          <User className="w-5 h-5 text-gray-500 group-hover:text-purple-500" />
                          <AnimatePresence>
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="ml-3 font-medium"
                            >
                              Your Profile
                            </motion.span>
                          </AnimatePresence>
                        </motion.div>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>
                      <motion.button
                        onClick={handleLogout}
                        whileHover={{
                          x: 5,
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center px-3 py-3 rounded-lg text-gray-600 hover:text-red-500 group transition-colors"
                      >
                        <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
                        <AnimatePresence>
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 font-medium"
                          >
                            Logout
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Breadcrumbs - Shown below navbar on mobile */}
      <div className="lg:hidden px-4 py-2 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center whitespace-nowrap">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-gray-600 mx-1 flex-shrink-0" />
              )}
              <Link
                href={breadcrumb.href}
                className={`text-xs font-medium transition-colors ${
                  index === breadcrumbs.length - 1
                    ? "text-purple-600"
                    : "text-gray-500 hover:text-purple-600"
                }`}
              >
                {breadcrumb.label}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="px-4 pt-2 pb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Search everything..."
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
