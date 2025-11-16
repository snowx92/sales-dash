// Lead types based on the API response

export interface LeadTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export type LeadSource = "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "SCRAPING" | "PERSONAL" | "SIGNUP" | "OTHER";
export type LeadPriority = "HIGH" | "MEDIUM" | "LOW";
export type LeadStatus = "NEW" | "INTERSTED" | "SUBSCRIBED" | "NOT_INTERSTED" | "NO_ANSWER" | "FOLLOW_UP" | "JUNK";

export interface ApiLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  websiteUrl?: string;
  socialMediaUrls?: string[];
  leadSource: LeadSource;
  priority: LeadPriority;
  status: LeadStatus;
  feedback?: string;
  salesId: string;
  createdAt: LeadTimestamp;
  feedbacks: string[];
  attemps: number;
  updatedAt: LeadTimestamp;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  websiteUrl?: string;
  socialMediaUrls?: string[];
  leadSource: LeadSource;
  priority: LeadPriority;
  status: LeadStatus; // allow NEW on creation
  feedback?: string;
  [key: string]: unknown; // Index signature for compatibility
}

export interface CreateLeadResponse {
  status: boolean;
  message: string;
  data: ApiLead;
}

export interface LeadsResponse {
  status: boolean;
  message: string;
  data: {
    items: ApiLead[];
    pageItems: number;
    totalItems: number;
    isLastPage: boolean;
    nextPageNumber: number;
    currentPage: number;
    totalPages: number;
    docsReaded: number;
  };
}

export interface LeadsRequest {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  status?: LeadStatus;
  searchQuery?: string;
}

export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  socialMediaUrls?: string[];
  leadSource?: LeadSource;
  priority?: LeadPriority;
  status?: LeadStatus;
  feedback?: string;
  [key: string]: unknown; // Index signature for compatibility
}

export interface UpdateLeadResponse {
  status: boolean;
  message: string;
  data: ApiLead;
}

export interface GetSingleLeadResponse {
  status: boolean;
  message: string;
  data: ApiLead;
}

export interface DeleteLeadResponse {
  status: boolean;
  message: string;
}

export interface AddFeedbackRequest {
  feedback: string;
}

export interface AddFeedbackResponse {
  status: boolean;
  message: string;
  data: ApiLead;
}

export interface LeadsOverviewResponse {
  status: number;
  message: string;
  data: {
    total: number;
    totalSubscribedLeads: number;
    totalInterestedLeads: number;
    totalFollowUpLeads: number;
    totalNotInterestedLeads: number;
  };
}
