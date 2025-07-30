
"use client"

import { useState } from "react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { PAGE_TITLES } from "@/lib/config/page-titles"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MerchantCard } from "@/components/store/MerchantCard"
import { Pagination } from "@/components/tables/Pagination"
import { MerchantModal } from "@/components/store/MerchantModal"
import { ExportSidebar } from "@/components/layout/export-sidebar"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useMerchants, Merchant } from "./useMerchants"
import { Toast } from '@/components/ui/toast';
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
                  <SelectTrigger className="text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 transition-colors duration-200">
                    <SelectValue placeholder="Sort by" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 shadow-lg">
                    <SelectItem value="date" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Date Created</SelectItem>
                    <SelectItem value="orders" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Orders</SelectItem>
                    <SelectItem value="site" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Website Visits</SelectItem>
                    <SelectItem value="products" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by plan</label>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 transition-colors duration-200">
                    <SelectValue placeholder="Filter by plan" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">All Plans</SelectItem>
                    <SelectItem value="free" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Free</SelectItem>
                    <SelectItem value="starter" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Starter</SelectItem>
                    <SelectItem value="plus" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Plus</SelectItem>
                    <SelectItem value="pro" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 transition-colors duration-200">
                    <SelectValue placeholder="Filter by status" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">All Statuses</SelectItem>
                    <SelectItem value="subscribed" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Subscribed</SelectItem>
                    <SelectItem value="not_subscribed" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Not Subscribed</SelectItem>
                    <SelectItem value="hidden" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Hidden Orders</SelectItem>
                    <SelectItem value="auto_renew" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Auto Renew</SelectItem>
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
  usePageTitle(PAGE_TITLES.MERCHANT_LIST);
  
  const {
    merchants,
    isLoading,
    totalItems,
    itemsPerPage,
    currentPage,
    sortBy,
    filterPlan,
    filterStatus,
    setCurrentPage,
    setSortBy,
    setFilterPlan,
    setFilterStatus,
    handleSearch,
    clearSearch,
    refetchMerchants,
  } = useMerchants();

  // We'll manage search input purely in local state
  const [localKeyword, setLocalKeyword] = useState("");

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [showDeleteToast, setShowDeleteToast] = useState(false)
  const [showRestoreToast, setShowRestoreToast] = useState(false)
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null)

  const handleSubscribe = (merchantId: string) => {
    setSelectedMerchant(merchants.find((m) => m.id === merchantId) || null)
  }

  const handleDelete = (merchantId: string) => {
    setSelectedMerchantId(merchantId)
    setShowDeleteToast(true)
  }

  const handleRestore = (merchantId: string) => {
    setSelectedMerchantId(merchantId)
    setShowRestoreToast(true)
  }

  const confirmDelete = () => {
    if (selectedMerchantId) {
      // Implement delete logic here
      console.log(`Deleting merchant with ID: ${selectedMerchantId}`)
    }
    setShowDeleteToast(false)
  }

  const confirmRestore = () => {
    if (selectedMerchantId) {
      // Implement restore logic here
      console.log(`Restoring data for merchant with ID: ${selectedMerchantId}`)
    }
    setShowRestoreToast(false)
  }

  const handleSubscriptionComplete = async () => {
    try {
      setSelectedMerchant(null);
      await refetchMerchants();
    } catch (error) {
      console.error('Failed to refresh merchants:', error);
      Toast.error({
        message: 'Refresh Failed',
        description: 'Failed to refresh merchant list. Please reload the page.'
      });
    }
  };

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
            className="pl-10 pr-16 text-base text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 transition-colors duration-200" // text-base prevents zoom on iOS
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
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
              <Search className="h-4 w-4 text-gray-700" />
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
              <SelectTrigger className="text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 transition-colors duration-200">
                <SelectValue placeholder="Sort by" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 shadow-lg">
                <SelectItem value="date" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Date Created</SelectItem>
                <SelectItem value="orders" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Orders</SelectItem>
                <SelectItem value="site" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Website Visits</SelectItem>
                <SelectItem value="products" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Products</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 transition-colors duration-200">
                <SelectValue placeholder="Filter by plan" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 shadow-lg">
                <SelectItem value="all" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">All Plans</SelectItem>
                <SelectItem value="free" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Free</SelectItem>
                <SelectItem value="starter" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Starter</SelectItem>
                <SelectItem value="plus" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Plus</SelectItem>
                <SelectItem value="pro" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Pro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400 transition-colors duration-200">
                <SelectValue placeholder="Filter by status" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 shadow-lg">
                <SelectItem value="all" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">All Statuses</SelectItem>
                <SelectItem value="subscribed" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Subscribed</SelectItem>
                <SelectItem value="not_subscribed" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Not Subscribed</SelectItem>
                <SelectItem value="hidden" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Hidden Orders</SelectItem>
                <SelectItem value="auto_renew" className="text-gray-900 hover:bg-purple-100 hover:text-purple-900 cursor-pointer transition-colors duration-150">Auto Renew</SelectItem>
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
              <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
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
                onSubscribe={() => handleSubscribe(merchant.id)}
                onDelete={() => handleDelete(merchant.id)}
                onReset={() => handleRestore(merchant.id)}
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

      {/* Modals */}
      {selectedMerchant && (
        <MerchantModal
          isOpen={!!selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
          storeData={selectedMerchant}
          onSubscriptionComplete={handleSubscriptionComplete}
        />
      )}

      {showDeleteToast && (
        <Dialog open={showDeleteToast} onOpenChange={setShowDeleteToast}>
          <DialogContent className="mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Delete Store</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the store? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowDeleteToast(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} className="w-full sm:w-auto">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showRestoreToast && (
        <Dialog open={showRestoreToast} onOpenChange={setShowRestoreToast}>
          <DialogContent className="mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>Restore Store Data</DialogTitle>
              <DialogDescription>
                Are you sure you want to restore the store data? This will restore all previous data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowRestoreToast(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={confirmRestore} className="w-full sm:w-auto">
                Restore
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ResponsiveWrapper>
  )
}

