import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { storesApi } from "@/lib/api/stores/storesApi";
import { GetStoresParams, Store } from "@/lib/api/stores/types";
import { SessionManager } from "@/lib/utils/session";
import { Timestamp } from "@/lib/api/services/commonTypes";

// Fix the category interface
interface Category {
  id: number;
  icon: string;
  name: string;
}

// Tab type for merchant view
export type MerchantTab = "my" | "all";

// Define the actual API response structure based on console logs
interface ActualApiResponse {
  currentPage: number;
  docsReaded: number;
  isLastPage: boolean;
  items: Store[];
  nextPageNumber?: number;
  pageItems: number;
  totalItems: number;
  totalPages: number;
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

// Track if initial fetch has happened to prevent duplicate calls
let initialFetchCompleted = false;

export const useMerchants = () => {
  const router = useRouter();
  const isInitialMount = useRef(true);
  
  // Add ref to track if a direct search was just performed
  const directSearchJustPerformedRef = useRef(false);
  
  // Initialize state with session storage values if available
  const [activeTab, setActiveTab] = useState<MerchantTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('merchantsActiveTab');
      return (saved as MerchantTab) || "my";
    }
    return "my";
  });
  
  const [keyword, setKeywordState] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('merchantsKeyword') || "";
    }
    return "";
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('merchantsPage');
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('merchantsSortBy') || "date";
    }
    return "date";
  });
  
  const [filterPlan, setFilterPlan] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('merchantsFilterPlan') || "all";
    }
    return "all";
  });
  
  const [filterStatus, setFilterStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('merchantsFilterStatus') || "all";
    }
    return "all";
  });
  
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('merchantsSearchTerm') || "";
    }
    return "";
  });

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [myMerchantsTotal, setMyMerchantsTotal] = useState(0);
  const [allMerchantsTotal, setAllMerchantsTotal] = useState(0);
  const itemsPerPage = 10;
  
  // Track if we're currently fetching to prevent duplicate calls
  const isFetchingRef = useRef(false);

  // Save filters to session storage
  const saveFiltersToSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('merchantsActiveTab', activeTab);
      sessionStorage.setItem('merchantsKeyword', keyword);
      sessionStorage.setItem('merchantsPage', currentPage.toString());
      sessionStorage.setItem('merchantsSortBy', sortBy);
      sessionStorage.setItem('merchantsFilterPlan', filterPlan);
      sessionStorage.setItem('merchantsFilterStatus', filterStatus);
      sessionStorage.setItem('merchantsSearchTerm', searchTerm);
    }
  }, [activeTab, keyword, currentPage, sortBy, filterPlan, filterStatus, searchTerm]);

  const fetchStores = useCallback(async (directSearchTerm?: string) => {
    // Prevent concurrent fetch calls
    if (isFetchingRef.current) {
      console.log("[Stores API] Fetch already in progress, skipping");
      return;
    }
    
    try {
      // Set the direct search flag if a direct search term is provided
      if (directSearchTerm !== undefined) {
        console.log("[Stores API] Direct search term provided:", directSearchTerm);
        
        // Even if directSearchTerm is empty, we consider this a direct search
        // to prevent filter effects from triggering another fetch
        directSearchJustPerformedRef.current = true;
        
        // Use a timeout to reset the flag after this execution context
        setTimeout(() => {
          directSearchJustPerformedRef.current = false;
        }, 100); // Use a slightly longer timeout to ensure event processing completes
      } else {
        console.log("[Stores API] No direct search term, using searchTerm from state:", searchTerm);
      }
      
      isFetchingRef.current = true;
      setIsLoading(true);
      saveFiltersToSession();
      
      const sessionManager = SessionManager.getInstance();

      if (!sessionManager.isLoggedIn()) {
        router.push("/login");
        return;
      }

      const token = await sessionManager.getCurrentToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const sortByMap: Record<string, "date" | "orders" | "site" | "products"> = {
        date: "date", // date 
        orders: "orders", // orders 
        site: "site", // site
        products: "products", // products
      };

      // Use directSearchTerm if provided, otherwise use searchTerm from state
      const effectiveSearchTerm = directSearchTerm !== undefined ? directSearchTerm : searchTerm;
      
      const apiParams: GetStoresParams = {
        pageNo: currentPage,
        limit: itemsPerPage,
        sortBy: sortByMap[sortBy],
        // Only include keyword if effectiveSearchTerm is not empty
        ...(effectiveSearchTerm && effectiveSearchTerm.length > 0 && { keyword: effectiveSearchTerm }),
        ...(filterStatus !== "all" && {
          status: filterStatus as "subscribed" | "not_subscribed" | "hidden",
        }),
        ...(filterPlan !== "all" && {
          planId: filterPlan as "pro" | "free" | "starter" | "plus",
        }),
      };

      console.log("[Stores API] Fetching with params:", apiParams);
      
      // Choose API based on active tab
      const response = activeTab === "my" 
        ? await storesApi.getMyStores(apiParams)
        : await storesApi.getStores(apiParams);
        
      console.log("[Stores API] Response:", response);

      // Handle the actual API response structure
      const actualResponse = response as unknown as ActualApiResponse;
      if (actualResponse && actualResponse.items && Array.isArray(actualResponse.items)) {
        const total = actualResponse.totalItems || 0;
        setTotalItems(total);
        
        // Store separate totals for each tab
        if (activeTab === "my") {
          setMyMerchantsTotal(total);
        } else {
          setAllMerchantsTotal(total);
        }
        
        const apiMerchants = actualResponse.items.map((store: Store) => ({
          id: store.id,
          storeName: store.name,
          storeLogo: store.logo || "/placeholder.svg",
          planName: store.plan?.planName || "N/A",
          subscribeDate: store.plan?.subscribeDate || null,
          storeUsername: store.merchantId,
          totalOrders: store.counters?.orders || 0,
          totalEmployees: store.counters?.teamCount || 0,
          websiteLink: store.defaultDomain || "",
          isTrial: store.plan?.isTrial || false,
          planExpirationDate: store.plan?.expireDate?._seconds
            ? new Date(store.plan.expireDate._seconds * 1000)
                .toISOString()
                .split("T")[0]
            : "N/A",
          ordersLimit: store.plan?.maxOrders || 0,
          currentOrders: store.plan?.currentOrders || 0,
          websiteVisits: store.counters?.visits || 0,
          products: store.counters?.products || 0,
          hiddenOrders: store.counters?.hiddenOrders || 0,
          status: store.plan?.planName === "free"
            ? "not_subscribed"
            : store.enabled
            ? "subscribed"
            : "not_subscribed",
          category: store.category ? {
            id: Number(store.category.id) || 0,
            icon: store.category.icon || '',
            name: store.category.name || 'Uncategorized'
          } : null,
          defaultCountry: store.defaultCountry || "",
          defaultCurrency: store.defaultCurrency || "",
          renewEnabled: store.plan?.renewEnabled || false,
          localMarkets: store.localMarkets || [],
        }));
        console.log("[Stores API] Processed merchants:", apiMerchants);
        setMerchants(apiMerchants);
      } else {
        console.log("[Stores API] No items in response");
        setTotalItems(0);
        setMerchants([]);
      }
    } catch (error) {
      console.error("[Stores API] Fetch error:", error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        router.push("/login");
      }
      setTotalItems(0);
      setMerchants([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [activeTab, currentPage, filterStatus, sortBy, filterPlan, searchTerm, router, saveFiltersToSession]);

  // Effect for filter changes (except searchTerm which has its own handler)
  useEffect(() => {
    // Skip on initial mount - the initialization effect handles the first fetch
    if (isInitialMount.current) {
      return;
    }
    
    // Skip if a direct search was just performed to prevent duplicate fetches
    if (directSearchJustPerformedRef.current) {
      console.log("[Effect] Skipping filter effect because a direct search was just performed");
      return;
    }
    
    console.log("[Effect] Filter change detected, calling fetchStores with current searchTerm:", searchTerm);
    
    // Only trigger API call for filter changes (sortBy, filterPlan, filterStatus, activeTab)
    // or page changes, but NOT for keyword/search input changes
    fetchStores();
  }, [activeTab, currentPage, filterStatus, sortBy, filterPlan, searchTerm, fetchStores]);

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
      
      console.log("[Search] Enter pressed, handleSearch called with keyword:", searchKeyword);
      
      // Set the search term from the current keyword
      const searchValue = searchKeyword.trim();
      console.log("[Search] Search value:", searchValue, "Previous search term:", searchTerm);
      
      // Update the searchTerm state for future reference
      // Note: This happens asynchronously and won't be available immediately
      setSearchTerm(searchValue);
      setKeywordState(searchValue); // Also update the keyword state to keep things in sync
      setCurrentPage(1);
      
      // Call fetchStores directly with the new search value
      // This bypasses the need to wait for the state update
      console.log("[Search] Calling fetchStores with direct search term:", searchValue);
      fetchStores(searchValue);
    }
  }, [keyword, fetchStores, setCurrentPage, searchTerm]);

  // Function to clear search and reset to default state
  const clearSearch = useCallback(() => {
    console.log("[Search] Clearing search");
    
    // Update state for future reference (happens asynchronously)
    setKeywordState("");
    setSearchTerm("");
    setCurrentPage(1);
    
    // Call fetchStores with empty search term to clear search
    // This bypasses the need to wait for state updates
    console.log("[Search] Fetching with cleared search term");
    fetchStores("");
  }, [fetchStores]);

  // Function to switch tabs
  const switchTab = useCallback((tab: MerchantTab) => {
    console.log("[Tab] Switching to tab:", tab);
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when switching tabs
  }, []);

  const fetchInitialTotals = useCallback(async () => {
    try {
      const sessionManager = SessionManager.getInstance();
      if (!sessionManager.isLoggedIn()) return;

      const token = await sessionManager.getCurrentToken();
      if (!token) return;

      // Set minimal params to get just counts
      const minimalParams = {
        limit: 1,
        pageNo: 1,
      };

      // Fetch both totals in parallel
      const [myResponse, allResponse] = await Promise.all([
        storesApi.getMyStores(minimalParams).catch(() => null),
        storesApi.getStores(minimalParams).catch(() => null),
      ]);

      if (myResponse) {
        const myActualResponse = myResponse as unknown as ActualApiResponse;
        setMyMerchantsTotal(myActualResponse.totalItems || 0);
      }

      if (allResponse) {
        const allActualResponse = allResponse as unknown as ActualApiResponse;
        setAllMerchantsTotal(allActualResponse.totalItems || 0);
      }
    } catch (error) {
      console.error("[Initial Totals] Error fetching totals:", error);
    }
  }, []);

  // Effect for initialization - runs exactly once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      const sessionManager = SessionManager.getInstance();
      if (!sessionManager.isLoggedIn()) {
        router.push("/login");
        return;
      }
      
      if (!initialFetchCompleted) {
        console.log("[Init] Performing initial fetch");
        initialFetchCompleted = true;
        fetchStores();
        
        // Also fetch totals for both tabs
        fetchInitialTotals();
      }
    }
  }, [router, fetchStores, fetchInitialTotals]);

  // Export the search handler
  return {
    merchants,
    isLoading,
    totalItems,
    myMerchantsTotal,
    allMerchantsTotal,
    itemsPerPage,
    currentPage,
    keyword,
    sortBy,
    filterPlan,
    filterStatus,
    activeTab,
    setCurrentPage,
    setKeyword,
    setSortBy,
    setFilterPlan,
    setFilterStatus,
    switchTab,
    handleSearch,
    clearSearch,
    refetchMerchants: fetchStores,
  };
}; 