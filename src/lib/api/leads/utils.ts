import type { ApiLead } from "./types";
import type { Lead, UpcomingLead } from "@/components/leads/types";

// Store mapping between component IDs and API IDs
const idMapping = new Map<number, string>();

/**
 * Store API ID mapping for component ID
 */
export const storeIdMapping = (componentId: number, apiId: string) => {
  idMapping.set(componentId, apiId);
};

/**
 * Get API ID from component ID
 */
export const getApiId = (componentId: number): string | undefined => {
  return idMapping.get(componentId);
};

/**
 * Generate a numeric ID from string ID for component compatibility
 */
const generateComponentId = (apiId: string): number => {
  // Create a hash of the API ID to get a consistent numeric ID
  let hash = 0;
  for (let i = 0; i < apiId.length; i++) {
    const char = apiId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Map API status to component status
 */
const mapApiStatusToComponent = (apiStatus: string): string => {
  const statusMap: Record<string, string> = {
    'NEW': 'new',
    'INTERSTED': 'interested', 
    'SUBSCRIBED': 'subscribed',
    'NOT_INTERSTED': 'not_interested',
    'NO_ANSWER': 'no_answer',
    'FOLLOW_UP': 'follow_up',
    'JUNK': 'junk'
  };
  return statusMap[apiStatus] || apiStatus.toLowerCase();
};

/**
 * Map API priority to component priority
 */
const mapApiPriorityToComponent = (apiPriority: string): string => {
  const priorityMap: Record<string, string> = {
    'HIGH': 'high',
    'MEDIUM': 'mid',
    'LOW': 'low'
  };
  return priorityMap[apiPriority] || apiPriority.toLowerCase();
};

/**
 * Map API lead source to component lead source
 */
const mapApiLeadSourceToComponent = (apiLeadSource: string): string => {
  const sourceMap: Record<string, string> = {
    'FACEBOOK': 'facebook',
    'INSTAGRAM': 'instagram',
    'TIKTOK': 'tiktok',
    'SCRAPING': 'web_scraping',
    'PERSONAL': 'personal',
    'SIGNUP': 'signup',
    'OTHER': 'other'
  };
  return sourceMap[apiLeadSource] || apiLeadSource.toLowerCase();
};

/**
 * Convert API lead to component Lead format
 */
export const mapApiLeadToLead = (apiLead: ApiLead): Lead => {
  const componentId = generateComponentId(apiLead.id);
  storeIdMapping(componentId, apiLead.id);
  
  const updatedAtIso = new Date(apiLead.updatedAt._seconds * 1000).toISOString();
  const updatedAtDate = updatedAtIso.split('T')[0];
  
  return {
    id: componentId,
    name: apiLead.name,
    email: apiLead.email,
    phone: apiLead.phone,
    website: apiLead.websiteUrl || '',
    socialUrls: (apiLead.socialMediaUrls || []).join(', '),
    leadSource: mapApiLeadSourceToComponent(apiLead.leadSource),
    status: mapApiStatusToComponent(apiLead.status),
    priority: mapApiPriorityToComponent(apiLead.priority),
    attempts: Number.isInteger(apiLead.attemps) ? apiLead.attemps : 0,
    lastContact: updatedAtDate, // keep old field for UI compatibility
    lastUpdated: updatedAtIso, // new precise timestamp for sorting
    feedback: apiLead.feedback || '',
    feedbackHistory: (apiLead.feedbacks || []).map((feedback, index) => ({
      id: index + 1,
      message: feedback,
      date: updatedAtDate
    })),
    createdAt: new Date(apiLead.createdAt._seconds * 1000).toISOString().split('T')[0]
  };
};

/**
 * Convert API lead to component UpcomingLead format
 */
export const mapApiLeadToUpcomingLead = (apiLead: ApiLead): UpcomingLead => {
  const componentId = generateComponentId(apiLead.id);
  storeIdMapping(componentId, apiLead.id);
  
  return {
    id: componentId,
    name: apiLead.name,
    email: apiLead.email,
    phone: apiLead.phone,
    website: apiLead.websiteUrl || '',
    socialUrls: (apiLead.socialMediaUrls || []).join(', '),
    leadSource: mapApiLeadSourceToComponent(apiLead.leadSource),
    priority: mapApiPriorityToComponent(apiLead.priority),
    createdAt: new Date(apiLead.createdAt._seconds * 1000).toISOString().split('T')[0]
  };
};

/**
 * Check if API lead should be in upcoming leads tab (status = NEW)
 */
export const isUpcomingLead = (apiLead: ApiLead): boolean => {
  return apiLead.status === "NEW";
};
