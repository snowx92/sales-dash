import type { ApiLead } from "./types";
import type { Lead, UpcomingLead, OnboardingAnswer } from "@/components/leads/types";

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
 * Parse the onboarding feedback JSON string from API
 */
const parseOnboardingFeedback = (feedback?: string): OnboardingAnswer[] => {
  if (!feedback) return [];
  
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(feedback);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    // If not valid JSON, return empty array
    // The feedback might be a regular feedback message, not onboarding data
    return [];
  }
};

/**
 * Parse feedback date from mixed API formats.
 */
const parseFeedbackDate = (value: unknown, fallbackDate: string): string => {
  if (value == null) return fallbackDate;

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallbackDate : parsed.toISOString().split("T")[0];
  }

  if (typeof value === "number") {
    const millis = value > 1e12 ? value : value * 1000;
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? fallbackDate : parsed.toISOString().split("T")[0];
  }

  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    const seconds =
      (typeof source._seconds === "number" && source._seconds) ||
      (typeof source.seconds === "number" && source.seconds);

    if (typeof seconds === "number") {
      return new Date(seconds * 1000).toISOString().split("T")[0];
    }
  }

  return fallbackDate;
};

/**
 * Normalize feedback message from mixed API formats.
 */
const normalizeFeedbackMessage = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const candidate =
      (typeof source.feedback === "string" && source.feedback) ||
      (typeof source.message === "string" && source.message) ||
      (typeof source.text === "string" && source.text) ||
      (typeof source.note === "string" && source.note);

    if (candidate) {
      return candidate.trim();
    }
  }

  return "";
};

/**
 * Normalize feedback history to UI shape.
 */
const mapFeedbackHistory = (apiLead: ApiLead, fallbackDate: string) => {
  const rawFeedbacks = Array.isArray(apiLead.feedbacks) ? apiLead.feedbacks : [];

  const normalized = rawFeedbacks
    .map((item, index) => {
      const message = normalizeFeedbackMessage(item);
      if (!message) return null;

      let date = fallbackDate;
      if (item && typeof item === "object") {
        const source = item as Record<string, unknown>;
        const dateCandidate = source.createdAt ?? source.updatedAt ?? source.date ?? source.time;
        date = parseFeedbackDate(dateCandidate, fallbackDate);
      }

      return {
        id: index + 1,
        message,
        date,
      };
    })
    .filter((item): item is { id: number; message: string; date: string } => Boolean(item));

  // Fallback for backends that only return `feedback` but no `feedbacks`.
  if (normalized.length === 0) {
    const message = normalizeFeedbackMessage(apiLead.feedback);
    if (message && parseOnboardingFeedback(apiLead.feedback).length === 0) {
      normalized.push({
        id: 1,
        message,
        date: fallbackDate,
      });
    }
  }

  return normalized;
};

/**
 * Convert API lead to component Lead format
 */
export const mapApiLeadToLead = (apiLead: ApiLead): Lead => {
  const componentId = generateComponentId(apiLead.id);
  storeIdMapping(componentId, apiLead.id);
  
  const updatedAtIso = new Date(apiLead.updatedAt._seconds * 1000).toISOString();
  const updatedAtDate = updatedAtIso.split('T')[0];
  const feedbackHistory = mapFeedbackHistory(apiLead, updatedAtDate);
  
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
    feedbackHistory,
    createdAt: new Date(apiLead.createdAt._seconds * 1000).toISOString().split('T')[0],
    // New fields
    createdAtRaw: apiLead.createdAt,
    onboardingFeedback: parseOnboardingFeedback(apiLead.feedback)
  };
};

/**
 * Convert API lead to component UpcomingLead format
 */
export const mapApiLeadToUpcomingLead = (apiLead: ApiLead): UpcomingLead => {
  const componentId = generateComponentId(apiLead.id);
  storeIdMapping(componentId, apiLead.id);

  const updatedAtIso = new Date(apiLead.updatedAt._seconds * 1000).toISOString();
  const updatedAtDate = updatedAtIso.split("T")[0];
  const feedbackHistory = mapFeedbackHistory(apiLead, updatedAtDate);
  
  return {
    id: componentId,
    name: apiLead.name,
    email: apiLead.email,
    phone: apiLead.phone,
    website: apiLead.websiteUrl || '',
    socialUrls: (apiLead.socialMediaUrls || []).join(', '),
    leadSource: mapApiLeadSourceToComponent(apiLead.leadSource),
    priority: mapApiPriorityToComponent(apiLead.priority),
    status: mapApiStatusToComponent(apiLead.status),
    attempts: Number.isInteger(apiLead.attemps) ? apiLead.attemps : 0,
    feedback: apiLead.feedback || "",
    lastContact: updatedAtDate,
    lastUpdated: updatedAtIso,
    createdAt: new Date(apiLead.createdAt._seconds * 1000).toISOString().split('T')[0],
    feedbackHistory,
    // New fields
    createdAtRaw: apiLead.createdAt,
    onboardingFeedback: parseOnboardingFeedback(apiLead.feedback)
  };
};

/**
 * Check if API lead should be in upcoming leads tab (status = NEW)
 */
export const isUpcomingLead = (apiLead: ApiLead): boolean => {
  return apiLead.status === "NEW";
};
