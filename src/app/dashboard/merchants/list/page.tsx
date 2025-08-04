
"use client"

import { useState, useEffect } from "react"
import { usePageTitle } from "@/lib/hooks/usePageTitle"
import { PAGE_TITLES } from "@/lib/config/page-titles"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MerchantCard } from "@/components/store/MerchantCard"
import { Pagination } from "@/components/tables/Pagination"
import { MerchantModal } from "@/components/store/MerchantModal"
import { ExportSidebar } from "@/components/layout/export-sidebar"
import { Search, Filter, X, ChevronDown, ChevronUp, Plus, Download, Copy, Check, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useMerchants, Merchant } from "./useMerchants"
import { Toast } from '@/components/ui/toast';
import { Toaster } from 'sonner';
import { Button } from "@/components/ui/button"
import { ResponsiveWrapper, ResponsiveCard } from "@/components/layout/ResponsiveWrapper"
import { motion, AnimatePresence } from "framer-motion"

// Country codes data
const countryCodes = [
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" }
];

interface FormData {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
}

interface CreatedStore {
  email: string;
  password: string;
}

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

  // Create store modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedBoth, setCopiedBoth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdStore, setCreatedStore] = useState<CreatedStore | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    countryCode: '+20', // Default to Egypt
    phoneNumber: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Initialize password on component mount
  useEffect(() => {
    generatePassword();
  }, []);

  // Export functionality
  const handleExport = () => {
    // Create CSV content
    const headers = ['Store Name', 'Store Username', 'Plan', 'Status', 'Orders', 'Products', 'Website Visits', 'Country', 'Currency'];
    const csvContent = [
      headers.join(','),
      ...merchants.map(merchant => [
        `"${merchant.storeName}"`,
        `"${merchant.storeUsername}"`,
        `"${merchant.planName}"`,
        `"${merchant.status}"`,
        `"${merchant.totalOrders}"`,
        `"${merchant.products}"`,
        `"${merchant.websiteVisits}"`,
        `"${merchant.defaultCountry}"`,
        `"${merchant.defaultCurrency}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `merchants-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{8,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setCreatedStore({
        email: formData.email,
        password: formData.password
      });
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      setIsSuccessModalOpen(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        countryCode: '+20',
        phoneNumber: '',
        password: ''
      });
      setFormErrors({});
      
      // Generate new password for next use
      setTimeout(() => generatePassword(), 100);
    }, 2000);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      // Failed to copy to clipboard
    }
  };

  const copyBothCredentials = async () => {
    if (!createdStore) return;
    
    const credentials = `Email: ${createdStore.email}\nPassword: ${createdStore.password}`;
    try {
      await navigator.clipboard.writeText(credentials);
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 2000);
    } catch (err) {
      // Failed to copy to clipboard
    }
  };

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
    }
    setShowDeleteToast(false)
  }

  const confirmRestore = () => {
    if (selectedMerchantId) {
      // Implement restore logic here
    }
    setShowRestoreToast(false)
  }

  const handleSubscriptionComplete = async () => {
    try {
      setSelectedMerchant(null);
      await refetchMerchants();
    } catch (error) {
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className="text-sm text-gray-500">
            {totalItems} merchants found
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Store
            </Button>
          </div>
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

      {/* Create Store Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Store</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStoreSubmit} className="space-y-4">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter store name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone Number with Country Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 min-w-[120px]"
                    >
                      {countryCodes.map((country, index) => (
                        <option key={index} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                        formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-blue-600 text-xs hover:underline mt-1"
                  >
                    Generate secure password
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Store'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal with Credentials */}
      <AnimatePresence>
        {isSuccessModalOpen && createdStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Store Created Successfully!</h2>
                <p className="text-gray-600">Here are the login credentials:</p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Email */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <button
                      onClick={() => copyToClipboard(createdStore.email, 'email')}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copiedField === 'email' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <code className="text-sm text-gray-800 break-all">{createdStore.email}</code>
                </div>

                {/* Password */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <button
                      onClick={() => copyToClipboard(createdStore.password, 'password')}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copiedField === 'password' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <code className="text-sm text-gray-800 font-mono">{createdStore.password}</code>
                </div>
              </div>

              {/* Copy Both Button */}
              <button
                onClick={copyBothCredentials}
                className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {copiedBoth ? (
                  <>
                    <Check className="h-4 w-4" />
                    Credentials Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Both Credentials
                  </>
                )}
              </button>

              <div className="text-center text-xs text-gray-500 mb-4">
                ⚠️ Please save these credentials securely. You won&apos;t be able to see the password again.
              </div>

              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ResponsiveWrapper>
  )
}

