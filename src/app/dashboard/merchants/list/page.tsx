"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MerchantCard } from "@/components/store/MerchantCard"
import { Pagination } from "@/components/tables/Pagination"
import { ExportSidebar } from "@/components/layout/export-sidebar"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { useMerchants, MerchantTab } from "./useMerchants"
import { Toaster } from 'sonner';
import { Button } from "@/components/ui/button"
import { ResponsiveWrapper, ResponsiveCard } from "@/components/layout/ResponsiveWrapper"
import { motion, AnimatePresence } from "framer-motion"

// Mobile filter component
const MobileFilters = ({ 
  sortBy, 
  setSortBy, 
  filterPlan, 
  setFilterPlan, 
  filterStatus, 
  setFilterStatus 
}: {
  sortBy: string;
  setSortBy: (value: string) => void;
  filterPlan: string;
  setFilterPlan: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="lg:hidden">
      <ResponsiveCard padding="sm" className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Filters & Sort</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white border border-gray-200 text-gray-900">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="date" className="text-gray-900 hover:bg-gray-50">Date Created</SelectItem>
                    <SelectItem value="orders" className="text-gray-900 hover:bg-gray-50">Orders</SelectItem>
                    <SelectItem value="site" className="text-gray-900 hover:bg-gray-50">Website Visits</SelectItem>
                    <SelectItem value="products" className="text-gray-900 hover:bg-gray-50">Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by plan</label>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="bg-white border border-gray-200 text-gray-900">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">All Plans</SelectItem>
                    <SelectItem value="free" className="text-gray-900 hover:bg-gray-50">Free</SelectItem>
                    <SelectItem value="starter" className="text-gray-900 hover:bg-gray-50">Starter</SelectItem>
                    <SelectItem value="plus" className="text-gray-900 hover:bg-gray-50">Plus</SelectItem>
                    <SelectItem value="pro" className="text-gray-900 hover:bg-gray-50">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white border border-gray-200 text-gray-900">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">All Statuses</SelectItem>
                    <SelectItem value="subscribed" className="text-gray-900 hover:bg-gray-50">Subscribed</SelectItem>
                    <SelectItem value="not_subscribed" className="text-gray-900 hover:bg-gray-50">Not Subscribed</SelectItem>
                    <SelectItem value="hidden" className="text-gray-900 hover:bg-gray-50">Hidden Orders</SelectItem>
                    <SelectItem value="auto_renew" className="text-gray-900 hover:bg-gray-50">Auto Renew</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveCard>
    </div>
  );
};

export default function MerchantListingPage() {
  const {
    merchants,
    isLoading,
    totalItems,
    myMerchantsTotal,
    allMerchantsTotal,
    itemsPerPage,
    currentPage,
    sortBy,
    filterPlan,
    filterStatus,
    activeTab,
    setCurrentPage,
    setSortBy,
    setFilterPlan,
    setFilterStatus,
    switchTab,
    handleSearch,
    clearSearch,
  } = useMerchants();

  // We'll manage search input purely in local state
  const [localKeyword, setLocalKeyword] = useState("");

  return (
    <ResponsiveWrapper padding="sm">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Merchants</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {totalItems} merchants found
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={(value) => switchTab(value as MerchantTab)}>
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="my" 
              className="relative overflow-hidden text-gray-600 font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/70 data-[state=active]:scale-[0.98]"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 data-[state=active]:animate-pulse"></div>
                <span>My Merchants</span>
                <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full min-w-[20px] text-center">
                  {myMerchantsTotal}
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="relative overflow-hidden text-gray-600 font-semibold data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/70 data-[state=active]:scale-[0.98]"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 data-[state=active]:animate-pulse"></div>
                <span>All Merchants</span>
                <div className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full min-w-[20px] text-center">
                  {allMerchantsTotal}
                </div>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search Bar */}
      <ResponsiveCard padding="sm" className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by store name or username..."
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                
                console.log("[Page] Enter key pressed with localKeyword:", localKeyword);
                
                const searchEvent = {
                  ...e,
                  localKeywordValue: localKeyword
                } as React.KeyboardEvent<HTMLInputElement> & { localKeywordValue: string };
                
                handleSearch(searchEvent);
              }
            }}
            className="pl-10 pr-16 text-base" // text-base prevents zoom on iOS
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {localKeyword && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setLocalKeyword("");
                  clearSearch();
                }}
                className="h-8 w-8"
              >
                <span className="sr-only">Clear search</span>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                
                console.log("[Page] Search button clicked with localKeyword:", localKeyword);
                
                const searchEvent = {
                  key: "Enter",
                  preventDefault: () => {},
                  stopPropagation: () => {},
                  localKeywordValue: localKeyword
                } as React.KeyboardEvent<HTMLInputElement> & { localKeywordValue: string };
                
                handleSearch(searchEvent);
              }}
              className="h-8 w-8"
            >
              <span className="sr-only">Search</span>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ResponsiveCard>

      {/* Mobile Filters */}
      <MobileFilters
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterPlan={filterPlan}
        setFilterPlan={setFilterPlan}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Desktop Filters */}
      <div className="hidden lg:block mb-6">
        <ResponsiveCard padding="sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white border border-gray-200 text-gray-900">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="date" className="text-gray-900 hover:bg-gray-50">Date Created</SelectItem>
                <SelectItem value="orders" className="text-gray-900 hover:bg-gray-50">Orders</SelectItem>
                <SelectItem value="site" className="text-gray-900 hover:bg-gray-50">Website Visits</SelectItem>
                <SelectItem value="products" className="text-gray-900 hover:bg-gray-50">Products</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="bg-white border border-gray-200 text-gray-900">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">All Plans</SelectItem>
                <SelectItem value="free" className="text-gray-900 hover:bg-gray-50">Free</SelectItem>
                <SelectItem value="starter" className="text-gray-900 hover:bg-gray-50">Starter</SelectItem>
                <SelectItem value="plus" className="text-gray-900 hover:bg-gray-50">Plus</SelectItem>
                <SelectItem value="pro" className="text-gray-900 hover:bg-gray-50">Pro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white border border-gray-200 text-gray-900">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">All Statuses</SelectItem>
                <SelectItem value="subscribed" className="text-gray-900 hover:bg-gray-50">Subscribed</SelectItem>
                <SelectItem value="not_subscribed" className="text-gray-900 hover:bg-gray-50">Not Subscribed</SelectItem>
                <SelectItem value="hidden" className="text-gray-900 hover:bg-gray-50">Hidden Orders</SelectItem>
                <SelectItem value="auto_renew" className="text-gray-900 hover:bg-gray-50">Auto Renew</SelectItem>
              </SelectContent>
            </Select>
            
            <ExportSidebar />
          </div>
        </ResponsiveCard>
      </div>

      {/* Export Sidebar for Mobile */}
      <div className="lg:hidden mb-4">
        <ExportSidebar />
      </div>

      {/* Merchants Grid */}
      <div className="space-y-4 mb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <ResponsiveCard key={i} padding="md" className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </ResponsiveCard>
            ))}
          </div>
        ) : merchants.length === 0 ? (
          <ResponsiveCard padding="md" className="text-center">
            <div className="py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No merchants found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </ResponsiveCard>
        ) : (
          merchants.map((merchant, index) => (
            <motion.div
              key={merchant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <MerchantCard
                {...merchant}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <ResponsiveCard padding="sm">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </ResponsiveCard>
      )}
    </ResponsiveWrapper>
  )
}

