export const PAGE_TITLES = {
  LOGIN: "Login - Vondera Sales Dashboard",
  DASHBOARD: "Dashboard - Vondera Sales",
  OVERVIEW: "Overview - Vondera Sales Dashboard", 
  MERCHANTS: "Merchants - Vondera Sales",
  MERCHANT_LIST: "Merchant List - Vondera Sales",
  MERCHANT_ANALYTICS: "Merchant Analytics - Vondera Sales",
  LEADS: "Leads - Vondera Sales Dashboard",
  RETENTION: "Retention - Vondera Sales Dashboard",
  ANALYTICS: "Analytics - Vondera Sales",
  TARGETS: "Sales Targets - Vondera Sales",
  TEAM: "Team Performance - Vondera Sales",
  SETTINGS: "Settings - Vondera Sales",
  PROFILE: "Profile - Vondera Sales"
} as const;

export type PageTitle = typeof PAGE_TITLES[keyof typeof PAGE_TITLES]; 