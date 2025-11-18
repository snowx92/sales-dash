// Root response
export interface EndedSubscriptionsResponse {
  status: number;
  message: string;
  data: EndedSubscriptionsData;
}

// Main data container
export interface EndedSubscriptionsData {
  items: EndedSubscriptionItem[];
  pageItems: number;
  totalItems: number;
  isLastPage: boolean;
  nextPageNumber: number;
  currentPage: number;
  totalPages: number;
  docsReaded: number;
}

// Priority type for feedback
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'JUNK';

// Each ended subscription item
export interface EndedSubscriptionItem {
  id: string;                   // Store ID for API operations (returned by API)
  name: string;
  storeName: string;
  merchantId: string;
  storeId?: string;             // Keep for backward compatibility if needed
  email: string;
  phone: string;                // Phone number from API (required)
  logo?: string;                // Store logo URL
  impact: number;
  attemps: number;
  expiredAt: string | null | { _seconds: number; _nanoseconds: number }; // Support both formats
  priority: Priority;
  renewCounts: number;
  link: string;
  feedbacks: string[];
}

// Feedback request body
export interface FeedbackRequest extends Record<string, unknown> {
  id: string;
  feedback: string;
  priority: Priority;
}

// Feedback response
export interface FeedbackResponse {
  status: number;
  message: string;
  data?: unknown;
}

// Query parameters for retention list
export interface RetentionQueryParams {
  limit?: number;
  pageNo?: number;
  keyword?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'JUNK';
}

// Retention overview data
export interface RetentionOverviewData {
  expiredCount: number;
  highPriorityCount: number;
  totalAttempts: number;
}
