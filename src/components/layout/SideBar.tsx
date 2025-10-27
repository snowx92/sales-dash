"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  UserPlus,
  RefreshCw,
  Banknote,
  User,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarCounters } from "@/lib/hooks/useSidebarCounters";
// Use direct string path for public assets
const logoSrc = "/logo.png";

// Navigation item interface
interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: keyof SidebarCounters;
}

interface SidebarCounters {
  stores: number;
  pendingLeads: number;
  allTransactions: number;
  newNotifications: number;
  retention: number;
}

// Navigation items for sales dashboard with counter keys
const navigationItems: NavigationItem[] = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/merchants/list", label: "Merchants", icon: ShoppingBag, countKey: "stores" },

  { href: "/dashboard/leads", label: "Leads", icon: UserPlus, countKey: "pendingLeads" },
  { href: "/dashboard/retention", label: "Retention", icon: RefreshCw, countKey: "retention" },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/transactions", label: "Transactions", icon: Banknote, countKey: "allTransactions" },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { counters, isLoading } = useSidebarCounters();

  // Notify parent when collapse state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isActiveRoute = (href: string) => {
    if (pathname === href) return true;
    if (pathname.startsWith(href) && href !== '/dashboard') {
      const remainingPath = pathname.slice(href.length);
      return remainingPath.startsWith('/');
    }
    return false;
  };

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  };

  const mobileOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  };

  return (
    <>
      <style jsx global>{`
        /* Custom Scrollbar Styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #7e22ce);
          opacity: 0.5;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #6b21a8);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9333ea73 rgba(243, 244, 246, 0.5);
        }

        /* Prevent scrolling when mobile menu is open */
        body.mobile-menu-open {
          overflow: hidden;
        }
      `}</style>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileOverlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div 
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-100 shadow-lg flex-col z-30"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-purple-600 rounded-full p-1.5 shadow-lg hover:bg-purple-700 z-50 transition-colors"
          style={{
            zIndex: 9999,
            position: 'absolute',
            right: '-12px',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </motion.div>
        </motion.button>

        {/* Fixed Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="flex-shrink-0 w-10 h-10 relative overflow-hidden"
            >
              <Image
                src={logoSrc}
                alt="Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  <span className="font-bold text-xl text-gray-800">Vondera</span>
                  <span className="text-xs text-purple-600 ml-2">Sales Dashboard</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scrollable Content with Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="py-6 px-3 space-y-2">
            <ul className="space-y-1">
              {navigationItems.map((item, index) => (
                <motion.li 
                  key={item.label} 
                  custom={index}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ x: 5, backgroundColor: "rgba(147, 51, 234, 0.1)" }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center px-3 py-3 rounded-lg group transition-all duration-200
                        ${isActiveRoute(item.href)
                          ? 'bg-purple-50 text-purple-700 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <motion.div
                        whileHover={{ rotate: 8, scale: 1.1 }}
                        className={`${isActiveRoute(item.href) ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'}`}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`ml-3 font-medium ${isActiveRoute(item.href) ? 'text-purple-700' : 'text-gray-600'} flex items-center justify-between flex-1`}
                          >
                            {item.label}
                            {item.countKey && (
                              <>
                                {isLoading ? (
                                  <span className="bg-gray-100 text-gray-400 text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                                    ...
                                  </span>
                                ) : (
                                  counters && counters[item.countKey] > 0 && (
                                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                                      {counters[item.countKey]}
                                    </span>
                                  )
                                )}
                              </>
                            )}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileSidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-white to-gray-50 border-r border-gray-100 shadow-xl z-50 lg:hidden flex flex-col"
          >
            {/* Mobile Header */}
            <div className="flex items-center h-16 px-4 border-b border-gray-100 bg-white">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="flex-shrink-0 w-10 h-10 relative overflow-hidden"
                >
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </motion.div>
                <div className="ml-3">
                  <span className="font-bold text-xl text-gray-800">Vondera</span>
                  <span className="text-xs text-purple-600 ml-2">Sales Dashboard</span>
                </div>
              </div>
            </div>

            {/* Mobile Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="py-6 px-3 space-y-2">
                <ul className="space-y-1">
                  {navigationItems.map((item, index) => (
                    <motion.li 
                      key={item.label} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div
                          whileHover={{ x: 5, backgroundColor: "rgba(147, 51, 234, 0.1)" }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center px-3 py-3 rounded-lg group transition-all duration-200
                            ${isActiveRoute(item.href)
                              ? 'bg-purple-50 text-purple-700 shadow-sm' 
                              : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          <motion.div
                            whileHover={{ rotate: 8, scale: 1.1 }}
                            className={`${isActiveRoute(item.href) ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'}`}
                          >
                            <item.icon className="w-5 h-5" />
                          </motion.div>
                          <span
                            className={`ml-3 font-medium ${isActiveRoute(item.href) ? 'text-purple-700' : 'text-gray-600'}`}
                          >
                            <span className="flex items-center justify-between w-full">
                              {item.label}
                              {item.countKey && (
                                <>
                                  {isLoading ? (
                                    <span className="bg-gray-100 text-gray-400 text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                                      ...
                                    </span>
                                  ) : (
                                    counters && counters[item.countKey] > 0 && (
                                      <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                                        {counters[item.countKey]}
                                      </span>
                                    )
                                  )}
                                </>
                              )}
                            </span>
                          </span>
                        </motion.div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}