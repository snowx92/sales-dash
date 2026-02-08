import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { storesApi } from "@/lib/api/stores/storesApi";
import { GetStoresParams, Store, AssignedSales, StoreCategory } from "@/lib/api/stores/types";
import { SessionManager } from "@/lib/utils/session";
import { Timestamp } from "@/lib/api/services/commonTypes";

// Fix the category interface
type Category = StoreCategory;

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

interface Step {
  desc: string;
  completed: boolean;
}

interface Steps {
  logo: Step;
  shippingAreas: Step;
  categories: Step;
  products: Step;
  adjustTheme: Step;
  order: Step;
  isAllComplete: boolean;
}

interface RetentionData {
  feedbacks: string[];
  priority: string;
  lastAttempt: Timestamp;
  attemps: number;
}

interface Merchant {
  id: string;
  storeName: string;
  storeLogo: string;
  planName: string;
  isTrial: boolean;
  isExpired: boolean;
  storeUsername: string;
  totalOrders: number;
  totalEmployees: number;
  totalCustomers: number;
  websiteLink: string;
  planExpirationDate: string;
  websiteVisits: number;
  products: number;
  hiddenOrders: number;
  status: string;
  category: Category | null;
  defaultCountry: string;
  defaultCurrency: string;
  renewEnabled: boolean;
  localMarkets: string[];
  assignedSales?: AssignedSales;
  createdAt: Timestamp;
  vPayBalance: number;
  isBeta: boolean;
  isWebsiteExpired: boolean;
  finishedSetup: boolean;
  steps?: Steps;
  retantion?: RetentionData;
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
  
  const [filterCategory, setFilterCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('merchantsFilterCategory') || "all";
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
  const [categories, setCategories] = useState<StoreCategory[]>([]);
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
      sessionStorage.setItem('merchantsFilterCategory', filterCategory);
      sessionStorage.setItem('merchantsSearchTerm', searchTerm);
    }
  }, [activeTab, keyword, currentPage, sortBy, filterPlan, filterStatus, filterCategory, searchTerm]);

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
        ...(filterCategory !== "all" && {
          storeCategoryNo: parseInt(filterCategory),
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
          isTrial: store.plan?.isTrial || false,
          isExpired: store.plan?.isExpired || false,
          storeUsername: store.merchantId,
          totalOrders: store.counters?.orders || 0,
          totalEmployees: store.counters?.teamCount || 0,
          totalCustomers: store.counters?.customers || 0,
          websiteLink: store.defaultDomain || "",
          planExpirationDate: store.plan?.expireDate?._seconds
            ? new Date(store.plan.expireDate._seconds * 1000)
                .toISOString()
                .split("T")[0]
            : "N/A",
          websiteVisits: store.counters?.visits || 0,
          products: store.counters?.products || 0,
          hiddenOrders: store.counters?.hiddenOrders || 0,
          status: store.plan?.planName?.toLowerCase() === "free"
            ? "not_subscribed"
            : store.plan?.isExpired
            ? "expired"
            : "subscribed",
          category: store.category ? {
            id: Number(store.category.id) || 0,
            icon: store.category.icon || '',
            name: store.category.name || 'Uncategorized'
          } : null,
          defaultCountry: store.defaultCountry || "",
          defaultCurrency: store.defaultCurrency || "",
          renewEnabled: store.plan?.renewEnabled || false,
          localMarkets: store.localMarkets || [],
          assignedSales: store.assignedSales || undefined,
          createdAt: store.createdAt,
          vPayBalance: store.vPayBalance || 0,
          isBeta: store.isBeta || false,
          isWebsiteExpired: store.isWebsiteExpired || false,
          finishedSetup: store.finishedSetup || false,
          steps: store.steps ? {
            logo: store.steps.logo || { desc: "Upload your logo", completed: false },
            shippingAreas: store.steps.shippingAreas || { desc: "Adjust your shipping areas", completed: false },
            categories: store.steps.categories || { desc: "Create your first category", completed: false },
            products: store.steps.products || { desc: "Add your first product", completed: false },
            adjustTheme: store.steps.adjustTheme || { desc: "Adjust your theme", completed: false },
            order: store.steps.order || { desc: "Receive your first order", completed: false },
            isAllComplete: store.steps.isAllComplete || false,
          } : undefined,
          retantion: store.retantion ? {
            feedbacks: store.retantion.feedbacks || [],
            priority: store.retantion.priority || "LOW",
            lastAttempt: store.retantion.lastAttempt,
            attemps: store.retantion.attemps || 0,
          } : undefined,
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
  }, [activeTab, currentPage, filterStatus, sortBy, filterPlan, filterCategory, searchTerm, router, saveFiltersToSession]);

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
  }, [activeTab, currentPage, filterStatus, sortBy, filterPlan, filterCategory, searchTerm, fetchStores]);

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

  // Function to fetch store categories
  const fetchCategories = useCallback(async () => {
    try {
      console.log("[Categories] Fetching store categories");
      const categoriesData = await storesApi.getStoreCategories();
      
      console.log("[Categories] Raw response:", categoriesData);
      
      if (categoriesData && Array.isArray(categoriesData)) {
        console.log("[Categories] Fetched categories:", categoriesData);
        setCategories(categoriesData);
      } else {
        console.warn("[Categories] No categories data received or invalid format:", categoriesData);
        setCategories([]);
      }
    } catch (error) {
      console.error("[Categories] Error fetching categories:", error);
      setCategories([]);
    }
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
        
        // Fetch categories
        fetchCategories();
      }
    }
  }, [router, fetchStores, fetchInitialTotals, fetchCategories]);

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
    filterCategory,
    categories,
    activeTab,
    setCurrentPage,
    setKeyword,
    setSortBy,
    setFilterPlan,
    setFilterStatus,
    setFilterCategory,
    switchTab,
    handleSearch,
    clearSearch,
    refetchMerchants: fetchStores,
  };
}; 