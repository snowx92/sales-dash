import { useState, useCallback, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { storesApi } from "@/lib/api/stores/storesApi";
// // // import { GetStoresParams } from "@/lib/api/stores/types";
// import { SessionManager } from "@/lib/utils/session";
// import { Timestamp } from "@/lib/api/services/commonTypes";

// Local Timestamp interface for static data
interface Timestamp {
  _seconds: number;
}

// Fix the category interface
interface Category {
  id: number;
  icon: string;
  name: string;
}

interface Merchant {
  id: string;
  storeName: string;
  storeLogo: string;
  planName: string;
  isTrial: boolean;
  subscribeDate: Timestamp | null;
  storeUsername: string;
  totalOrders: number;
  totalEmployees: number;
  websiteLink: string;
  planExpirationDate: string;
  ordersLimit: number;
  currentOrders: number;
  websiteVisits: number;
  products: number;
  hiddenOrders: number;
  status: string;
  category: Category | null;
  defaultCountry: string;
  defaultCurrency: string;
  renewEnabled: boolean;
  localMarkets: string[];
}

// Export Merchant type for use in other components 
export type { Merchant };

// Static merchants data - Replace API calls with mock data
const staticMerchantsData: Merchant[] = [
  {
    id: "merchant_001",
    storeName: "TechWorld Electronics",
    storeLogo: "/placeholder.svg",
    planName: "pro",
    isTrial: false,
    subscribeDate: { _seconds: 1704067200 }, // Jan 1, 2024
    storeUsername: "techworld_store",
    totalOrders: 1250,
    totalEmployees: 15,
    websiteLink: "https://techworld-electronics.com",
    planExpirationDate: "2025-01-01",
    ordersLimit: 10000,
    currentOrders: 1250,
    websiteVisits: 8500,
    products: 450,
    hiddenOrders: 0,
    status: "subscribed",
    category: {
      id: 1,
      icon: "/placeholder.svg",
      name: "Electronics"
    },
    defaultCountry: "United States",
    defaultCurrency: "USD",
    renewEnabled: true,
    localMarkets: ["New York", "California"]
  },
  {
    id: "merchant_002",
    storeName: "Fashion Forward",
    storeLogo: "/placeholder.svg",
    planName: "starter",
    isTrial: true,
    subscribeDate: { _seconds: 1704153600 }, // Jan 2, 2024
    storeUsername: "fashion_forward",
    totalOrders: 680,
    totalEmployees: 8,
    websiteLink: "https://fashion-forward.com",
    planExpirationDate: "2024-07-02",
    ordersLimit: 5000,
    currentOrders: 680,
    websiteVisits: 3200,
    products: 280,
    hiddenOrders: 5,
    status: "subscribed",
    category: {
      id: 2,
      icon: "/placeholder.svg",
      name: "Fashion"
    },
    defaultCountry: "Canada",
    defaultCurrency: "CAD",
    renewEnabled: false,
    localMarkets: ["Toronto", "Vancouver"]
  },
  {
    id: "merchant_003",
    storeName: "Home & Garden Plus",
    storeLogo: "/placeholder.svg",
    planName: "free",
    isTrial: false,
    subscribeDate: { _seconds: 1704240000 }, // Jan 3, 2024
    storeUsername: "home_garden_plus",
    totalOrders: 150,
    totalEmployees: 3,
    websiteLink: "https://home-garden-plus.com",
    planExpirationDate: "N/A",
    ordersLimit: 1000,
    currentOrders: 150,
    websiteVisits: 1200,
    products: 120,
    hiddenOrders: 0,
    status: "not_subscribed",
    category: {
      id: 3,
      icon: "/placeholder.svg",
      name: "Home & Garden"
    },
    defaultCountry: "United Kingdom",
    defaultCurrency: "GBP",
    renewEnabled: false,
    localMarkets: ["London", "Manchester"]
  },
  {
    id: "merchant_004",
    storeName: "Sports Central",
    storeLogo: "/placeholder.svg",
    planName: "plus",
    isTrial: false,
    subscribeDate: { _seconds: 1704326400 }, // Jan 4, 2024
    storeUsername: "sports_central",
    totalOrders: 890,
    totalEmployees: 12,
    websiteLink: "https://sports-central.com",
    planExpirationDate: "2024-12-04",
    ordersLimit: 7500,
    currentOrders: 890,
    websiteVisits: 5500,
    products: 350,
    hiddenOrders: 2,
    status: "subscribed",
    category: {
      id: 4,
      icon: "/placeholder.svg",
      name: "Sports"
    },
    defaultCountry: "Australia",
    defaultCurrency: "AUD",
    renewEnabled: true,
    localMarkets: ["Sydney", "Melbourne"]
  },
  {
    id: "merchant_005",
    storeName: "Book Haven",
    storeLogo: "/placeholder.svg",
    planName: "starter",
    isTrial: false,
    subscribeDate: { _seconds: 1704412800 }, // Jan 5, 2024
    storeUsername: "book_haven",
    totalOrders: 420,
    totalEmployees: 5,
    websiteLink: "https://book-haven.com",
    planExpirationDate: "2024-10-05",
    ordersLimit: 5000,
    currentOrders: 420,
    websiteVisits: 2800,
    products: 180,
    hiddenOrders: 1,
    status: "subscribed",
    category: {
      id: 5,
      icon: "/placeholder.svg",
      name: "Books"
    },
    defaultCountry: "Germany",
    defaultCurrency: "EUR",
    renewEnabled: true,
    localMarkets: ["Berlin", "Munich"]
  }
];

// Track if initial fetch has happened to prevent duplicate calls
let initialFetchCompleted = false;

export const useMerchants = () => {
  // const router = useRouter(); // Commented out for static data
  const isInitialMount = useRef(true);
  
  // Add ref to track if a direct search was just performed
  const directSearchJustPerformedRef = useRef(false);
  
  // State declarations
  const [keyword, setKeywordState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Track if we're currently fetching to prevent duplicate calls
  const isFetchingRef = useRef(false);

  // Save filters to session storage
  const saveFiltersToSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('merchantsKeyword', keyword);
      sessionStorage.setItem('merchantsPage', currentPage.toString());
      sessionStorage.setItem('merchantsSortBy', sortBy);
      sessionStorage.setItem('merchantsFilterPlan', filterPlan);
      sessionStorage.setItem('merchantsFilterStatus', filterStatus);
      sessionStorage.setItem('merchantsSearchTerm', searchTerm);
    }
  }, [keyword, currentPage, sortBy, filterPlan, filterStatus, searchTerm]);

  const fetchStores = useCallback(async (directSearchTerm?: string) => {
    // Prevent concurrent fetch calls
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      // Set the direct search flag if a direct search term is provided
      if (directSearchTerm !== undefined) {
        // Even if directSearchTerm is empty, we consider this a direct search
        // to prevent filter effects from triggering another fetch
        directSearchJustPerformedRef.current = true;
        
        // Use a timeout to reset the flag after this execution context
        setTimeout(() => {
          directSearchJustPerformedRef.current = false;
        }, 100); // Use a slightly longer timeout to ensure event processing completes
      } else {
      }
      
      isFetchingRef.current = true;
      setIsLoading(true);
      saveFiltersToSession();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // COMMENTED OUT: API authentication and token handling
      // const sessionManager = SessionManager.getInstance();
      // if (!sessionManager.isAuthenticated()) {
      //   router.push("/login");
      //   return;
      // }
      // const token = await sessionManager.getCurrentToken();
      // if (!token) {
      //   router.push("/login");
      //   return;
      // }

      // Use directSearchTerm if provided, otherwise use searchTerm from state
      const effectiveSearchTerm = directSearchTerm !== undefined ? directSearchTerm : searchTerm;
      
      // Filter static data based on search term and filters
      let filteredMerchants = [...staticMerchantsData];
      
      // Apply search filter
      if (effectiveSearchTerm && effectiveSearchTerm.length > 0) {
        filteredMerchants = filteredMerchants.filter(merchant =>
          merchant.storeName.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
          merchant.storeUsername.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
        );
      }
      
      // Apply status filter
      if (filterStatus !== "all") {
        filteredMerchants = filteredMerchants.filter(merchant => 
          merchant.status === filterStatus
        );
      }
      
      // Apply plan filter
      if (filterPlan !== "all") {
        filteredMerchants = filteredMerchants.filter(merchant => 
          merchant.planName === filterPlan
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case "orders":
          filteredMerchants.sort((a, b) => b.totalOrders - a.totalOrders);
          break;
        case "products":
          filteredMerchants.sort((a, b) => b.products - a.products);
          break;
        case "site":
          filteredMerchants.sort((a, b) => b.websiteVisits - a.websiteVisits);
          break;
        case "date":
        default:
          filteredMerchants.sort((a, b) => {
            const dateA = a.subscribeDate?._seconds || 0;
            const dateB = b.subscribeDate?._seconds || 0;
            return dateB - dateA;
          });
          break;
      }
      
      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedMerchants = filteredMerchants.slice(startIndex, endIndex);
      
      setTotalItems(filteredMerchants.length);
      setMerchants(paginatedMerchants);
      
      // COMMENTED OUT: Original API call
      // const apiParams: GetStoresParams = {
      //   pageNo: currentPage,
      //   limit: itemsPerPage,
      //   sortBy: sortByMap[sortBy],
      //   // Only include keyword if effectiveSearchTerm is not empty
      //   ...(effectiveSearchTerm && effectiveSearchTerm.length > 0 && { keyword: effectiveSearchTerm }),
      //   ...(filterStatus !== "all" && {
      //     status: filterStatus as "subscribed" | "not_subscribed" | "hidden",
      //   }),
      //   ...(filterPlan !== "all" && {
      //     planId: filterPlan as "pro" | "free" | "starter" | "plus",
      //   }),
      // };
      // console.log("[Stores API] Fetching with params:", apiParams);
      // const response = await storesApi.getStores(apiParams);
      // console.log("[Stores API] Response:", response);

    } catch {
      // COMMENTED OUT: Authentication error handling
      // if (error instanceof Error && error.message.includes("Unauthorized")) {
      //   router.push("/login");
      // }
      setTotalItems(0);
      setMerchants([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentPage, filterStatus, sortBy, filterPlan, searchTerm, saveFiltersToSession]);

  // Effect for filter changes (except searchTerm which has its own handler)
  useEffect(() => {
    // Skip on initial mount - the initialization effect handles the first fetch
    if (isInitialMount.current) {
      return;
    }
    
    // Skip if a direct search was just performed to prevent duplicate fetches
    if (directSearchJustPerformedRef.current) {
      return;
    }
    
    // Only trigger API call for filter changes (sortBy, filterPlan, filterStatus)
    // or page changes, but NOT for keyword/search input changes
    fetchStores();
  }, [currentPage, filterStatus, sortBy, filterPlan, fetchStores]);

  // Custom setKeyword function that doesn't trigger API calls
  const setKeyword = useCallback((value: string) => {
    setKeywordState(value);
    // Note: We don't update searchTerm or trigger fetchStores here
    // This is only done when handleSearch is called
  }, []);

  // Handle search submission - updates searchTerm which triggers API call
  const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement> & { localKeywordValue?: string }) => {
    // Only process Enter key events
    if (e.key === "Enter") {
      // Track that this is a direct search using a ref
      directSearchJustPerformedRef.current = true;
      
      // Reset the flag after this execution context to allow future filter effects
      setTimeout(() => {
        directSearchJustPerformedRef.current = false;
      }, 100); // Use a slightly longer timeout to ensure event processing completes
      
      // Use localKeywordValue if provided, otherwise use the keyword from state
      const searchKeyword = e.localKeywordValue !== undefined ? e.localKeywordValue : keyword;
      
      // Set the search term from the current keyword
      const searchValue = searchKeyword.trim();
      
      // Update the searchTerm state for future reference
      // Note: This happens asynchronously and won't be available immediately
      setSearchTerm(searchValue);
      setKeywordState(searchValue); // Also update the keyword state to keep things in sync
      setCurrentPage(1);
      
      // Call fetchStores directly with the new search value
      // This bypasses the need to wait for the state update
      fetchStores(searchValue);
    }
  }, [keyword, fetchStores, setCurrentPage, searchTerm]);

  // Function to clear search and reset to default state
  const clearSearch = useCallback(() => {
    // Update state for future reference (happens asynchronously)
    setKeywordState("");
    setSearchTerm("");
    setCurrentPage(1);
    
    // Call fetchStores with empty search term to clear search
    // This bypasses the need to wait for state updates
    fetchStores("");
  }, [fetchStores]);

  // Effect for initialization - runs exactly once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // COMMENTED OUT: SessionManager initialization
      // const sessionManager = SessionManager.getInstance();
      // if (!sessionManager.isAuthenticated()) {
      //   router.push("/login");
      //   return;
      // }
      
      if (!initialFetchCompleted) {
        initialFetchCompleted = true;
        fetchStores();
      }
    }
  }, [fetchStores]);

  // Export the search handler
  return {
    merchants,
    isLoading,
    totalItems,
    itemsPerPage,
    currentPage,
    keyword,
    sortBy,
    filterPlan,
    filterStatus,
    setCurrentPage,
    setKeyword,
    setSortBy,
    setFilterPlan,
    setFilterStatus,
    handleSearch,
    clearSearch,
    refetchMerchants: fetchStores,
  };
}; 