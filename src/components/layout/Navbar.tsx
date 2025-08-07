"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/lib/api/auth/utils";
import { profileService, type UserProfile } from "@/lib/api/profile/profileService";
import { overviewService } from "@/lib/api/overview/overviewService";
import { notificationService, type NotificationItem } from "@/lib/api/notifications";
import { firebaseMessaging } from "@/lib/firebase/messaging";
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

export default function Navbar({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen
}: NavbarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [navbarAffiliateLink, setNavbarAffiliateLink] = useState<string>("");
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationLoading, setNotificationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreNotifications, setHasMoreNotifications] = useState<boolean>(true);
  const [readAllLoading, setReadAllLoading] = useState<boolean>(false);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { label: string; href: string }[]
  >([]);

  // Fetch user profile and affiliate link data
  useEffect(() => {
    const fetchUserData = async () => {
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

        // Fetch profile data
        const response = await profileService.getProfile();
        console.log("📋 Navbar: Profile response:", response);
        
        if (response && response.status && response.data) {
          setUserProfile(response.data);
          console.log("✅ Navbar: Profile loaded successfully:", response.data);
        } else {
          console.log("❌ Navbar: Invalid profile response:", response);
        }

        // Fetch overview data for affiliate link
        try {
          const overviewResponse = await overviewService.getOverview();
          if (overviewResponse?.user?.refferLink) {
            setNavbarAffiliateLink(overviewResponse.user.refferLink);
            console.log("✅ Navbar: Affiliate link loaded:", overviewResponse.user.refferLink);
          }
        } catch (overviewError) {
          console.log("⚠️ Navbar: Could not fetch affiliate link:", overviewError);
          // Not critical, so we don't show error to user
        }

        // Fetch unread notifications count
        try {
          const unreadCount = await notificationService.getUnreadCount();
          setUnreadNotifications(unreadCount);
          console.log("🔔 Navbar: Unread notifications count:", unreadCount);
        } catch (notificationError) {
          console.log("⚠️ Navbar: Could not fetch notifications count:", notificationError);
          // Not critical, so we don't show error to user
        }

        // Initialize FCM token (optional - only in production/when needed)
        try {
          if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_FCM === 'true') {
            console.log("📱 Navbar: Initializing FCM token...");
            await firebaseMessaging.requestPermissionAndGetToken();
          }
        } catch (fcmError) {
          console.log("⚠️ Navbar: Could not initialize FCM:", fcmError);
          // Not critical, so we don't show error to user
        }
      } catch (error) {
        console.error("🚨 Navbar: Profile fetch error:", error);
        // Don't show error to user in navbar, just fallback to default
      }
    };

    fetchUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Handle copy affiliate link
  const handleCopyAffiliateLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy affiliate link:', err);
    }
  };

  // Handle copy referral code
  const handleCopyReferralCode = async () => {
    try {
      // Extract referral code from affiliate link
      let referralCode = '';
      if (navbarAffiliateLink) {
        try {
          const url = new URL(navbarAffiliateLink);
          // Try to get referral code from different possible URL patterns
          referralCode = url.searchParams.get('ref') || 
                        url.searchParams.get('referral') || 
                        url.searchParams.get('code') ||
                        url.pathname.split('/').pop() || 
                        navbarAffiliateLink.split('/').pop() ||
                        'REF_CODE';
        } catch {
          // If URL parsing fails, try to extract from the end of the string
          referralCode = navbarAffiliateLink.split('/').pop() || 'REF_CODE';
        }
      }
      
      await navigator.clipboard.writeText(referralCode);
      
      // Visual feedback - you could replace this with a toast notification
      console.log('✅ Referral code copied:', referralCode);
      
      // Optional: Add a temporary tooltip or flash effect
      // This could be enhanced with a toast notification library
      
    } catch (err) {
      console.error('Failed to copy referral code:', err);
    }
  };

  // Load notifications
  const loadNotifications = async (page: number = 1, append: boolean = false) => {
    try {
      setNotificationLoading(true);
      console.log(`🔔 Loading notifications page ${page}...`);
      
      const response = await notificationService.getNotifications({
        pageNo: page,
        limit: 5
      });
      
      console.log(`🔔 Navbar: Raw notification response:`, response);
      
      if (response?.data) {
        const newNotifications = response.data.items || [];
        
        console.log(`🔔 Navbar: Processing ${newNotifications.length} notifications`);
        console.log(`🔔 Navbar: First notification:`, newNotifications[0]);
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setUnreadNotifications(response.data.newNotifications || 0);
        setHasMoreNotifications(!response.data.isLastPage);
        setCurrentPage(page);
        
        console.log(`✅ Loaded ${newNotifications.length} notifications`);
        console.log(`🔔 Total notifications in state: ${append ? notifications.length + newNotifications.length : newNotifications.length}`);
      } else {
        console.warn(`⚠️ Navbar: No data in response:`, response);
      }
    } catch (error) {
      console.error('🚨 Error loading notifications:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Handle notification dropdown toggle
  const handleNotificationClick = async () => {
    if (!isNotificationOpen) {
      // Load initial notifications when opening
      await loadNotifications(1, false);
    }
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Load more notifications
  const handleLoadMore = async () => {
    if (!notificationLoading && hasMoreNotifications) {
      await loadNotifications(currentPage + 1, true);
    }
  };

  // Mark all notifications as read
  const handleReadAll = async () => {
    try {
      setReadAllLoading(true);
      console.log('🔔 Marking all notifications as read...');
      
      await notificationService.readAllNotifications();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isNew: false
        }))
      );
      setUnreadNotifications(0);
      
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('🚨 Error marking notifications as read:', error);
    } finally {
      setReadAllLoading(false);
    }
  };

  // Format notification date
  const formatNotificationDate = (timestamp: { _seconds: number; _nanoseconds: number }): string => {
    const date = new Date(timestamp._seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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

      // Check if click is outside notification dropdown
      if (isNotificationOpen) {
        const notificationDropdown = document.querySelector('[data-notification-dropdown]');
        const notificationButton = document.querySelector('[data-notification-button]');
        
        if (notificationDropdown && notificationButton) {
          if (!notificationDropdown.contains(target) && !notificationButton.contains(target)) {
            setIsNotificationOpen(false);
          }
        }
      }
    };

    // Add event listener when dropdowns are open
    if (isProfileOpen || isNotificationOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileOpen, isNotificationOpen]);

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

          {/* Right section with affiliate link, notifications and profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Affiliate Actions - Enhanced Design */}
            {navbarAffiliateLink && (
              <div className="flex items-center gap-2">
                {/* Desktop version - Enhanced buttons with affiliate link */}
                <div className="hidden sm:flex items-center gap-2">
                  {/* Affiliate Link Display */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200/50">
                    <span className="text-xs text-gray-600 truncate max-w-[120px] lg:max-w-[180px]">
                      {navbarAffiliateLink}
                    </span>
                    <button
                      onClick={() => handleCopyAffiliateLink(navbarAffiliateLink)}
                      className="p-1 rounded-md text-purple-500 hover:text-purple-700 hover:bg-purple-100 transition-all duration-200 group"
                      title="Copy affiliate link"
                    >
                      <Copy className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  
                  {/* Copy Referral Code Button */}
                  <button
                    onClick={handleCopyReferralCode}
                    className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-50 to-pink-50 text-orange-600 hover:text-orange-700 border border-orange-200/50 rounded-lg hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 transition-all duration-200 group"
                    title="Copy referral code"
                  >
                    <Copy className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium hidden lg:inline">Code</span>
                  </button>
                </div>
                
                {/* Mobile version - Compact buttons */}
                <div className="sm:hidden flex items-center gap-1">
                  <button
                    onClick={() => handleCopyAffiliateLink(navbarAffiliateLink)}
                    className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all duration-200"
                    title="Copy affiliate link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCopyReferralCode}
                    className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-200"
                    title="Copy referral code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick();
                }}
                className="p-2 rounded-full text-gray-500 hover:text-purple-600 focus:outline-none relative transition-colors"
                data-notification-button
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {/* Notification badge */}
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-96"
                    data-notification-dropdown
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={handleReadAll}
                          disabled={readAllLoading}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                        >
                          {readAllLoading ? 'Reading...' : 'Mark all read'}
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-64 overflow-y-auto">
                      {notificationLoading && notifications.length === 0 ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                          <p className="text-xs text-gray-500 mt-2">Loading notifications...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
                      ) : (
                        <>
                          {notifications.map((notification, index) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                notification.isNew ? 'bg-purple-50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`mt-1 w-2 h-2 rounded-full ${notification.isNew ? 'bg-purple-600' : 'bg-transparent'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.content.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical' as const
                                  }}>
                                    {notification.content.body}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatNotificationDate(notification.date)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {/* Load More Button */}
                          {hasMoreNotifications && (
                            <div className="p-3 border-t border-gray-100">
                              <button
                                onClick={handleLoadMore}
                                disabled={notificationLoading}
                                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2 disabled:opacity-50"
                              >
                                {notificationLoading ? (
                                  <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                    <span>Loading...</span>
                                  </div>
                                ) : (
                                  'Load more'
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
    </nav>
  );
}
