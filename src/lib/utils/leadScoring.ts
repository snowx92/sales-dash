import { Lead } from "@/components/leads/types";

export interface LeadScore {
  total: number;
  breakdown: {
    recency: number;
    source: number;
    engagement: number;
    priority: number;
  };
  rating: 'hot' | 'warm' | 'cold';
  recommendations: string[];
}

/**
 * Calculate lead score based on multiple factors
 * Score range: 0-100
 */
export function calculateLeadScore(lead: Lead): LeadScore {
  const breakdown = {
    recency: calculateRecencyScore(lead),
    source: calculateSourceScore(lead),
    engagement: calculateEngagementScore(lead),
    priority: calculatePriorityScore(lead),
  };

  const total = Math.round(
    breakdown.recency * 0.3 +
    breakdown.source * 0.2 +
    breakdown.engagement * 0.3 +
    breakdown.priority * 0.2
  );

  return {
    total,
    breakdown,
    rating: getRating(total),
    recommendations: getRecommendations(lead, total),
  };
}

/**
 * Recency score: How recently was this lead created/contacted?
 */
function calculateRecencyScore(lead: Lead): number {
  const now = new Date();
  const lastContact = lead.lastContact ? new Date(lead.lastContact) : new Date(lead.createdAt);
  const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceContact === 0) return 100;
  if (daysSinceContact <= 1) return 90;
  if (daysSinceContact <= 3) return 70;
  if (daysSinceContact <= 7) return 50;
  if (daysSinceContact <= 14) return 30;
  if (daysSinceContact <= 30) return 15;
  return 5;
}

/**
 * Source score: Quality of lead source
 */
function calculateSourceScore(lead: Lead): number {
  const sourceScores: Record<string, number> = {
    'signup': 100,        // Self-signup = highest intent
    'personal': 90,       // Personal connection
    'facebook': 70,       // Social media
    'instagram': 70,
    'tiktok': 60,
    'scraping': 40,       // Cold outreach
    'other': 50,
  };

  return sourceScores[lead.leadSource?.toLowerCase()] || 50;
}

/**
 * Engagement score: How much has this lead engaged?
 */
function calculateEngagementScore(lead: Lead): number {
  let score = 0;

  // Status-based scoring
  const statusScores: Record<string, number> = {
    'subscribed': 100,
    'interested': 80,
    'follow_up': 60,
    'new': 40,
    'no_answer': 20,
    'not_interested': 10,
  };
  score += statusScores[lead.status] || 40;

  // Feedback history (more feedback = more engagement)
  const feedbackCount = lead.feedbackHistory?.length || 0;
  if (feedbackCount > 5) score += 20;
  else if (feedbackCount > 3) score += 15;
  else if (feedbackCount > 0) score += 10;

  // Attempts (but diminishing returns)
  if (lead.attempts > 10) score += 10;
  else if (lead.attempts > 5) score += 15;
  else if (lead.attempts > 2) score += 20;
  else if (lead.attempts === 1) score += 10;

  // Has contact info
  if (lead.email) score += 10;
  if (lead.phone) score += 10;
  if (lead.website) score += 5;

  return Math.min(100, score / 1.5); // Normalize to 0-100
}

/**
 * Priority score
 */
function calculatePriorityScore(lead: Lead): number {
  const priorityScores: Record<string, number> = {
    'high': 100,
    'mid': 60,
    'low': 30,
  };

  return priorityScores[lead.priority] || 50;
}

/**
 * Convert score to rating
 */
function getRating(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

/**
 * Get actionable recommendations based on score
 */
function getRecommendations(lead: Lead, total: number): string[] {
  const recommendations: string[] = [];

  // Recency recommendations
  const now = new Date();
  const lastContact = lead.lastContact ? new Date(lead.lastContact) : new Date(lead.createdAt);
  const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceContact > 7 && lead.status !== 'not_interested') {
    recommendations.push(`⚠️ No contact in ${daysSinceContact} days - Follow up urgently`);
  } else if (daysSinceContact > 3) {
    recommendations.push(`📞 Follow up soon (${daysSinceContact} days since last contact)`);
  }

  // Status recommendations
  if (lead.status === 'interested' && daysSinceContact < 2) {
    recommendations.push('🔥 High intent! Send pricing & schedule demo immediately');
  }

  if (lead.status === 'follow_up' && lead.attempts < 3) {
    recommendations.push('📧 Try different channel (email if called, call if emailed)');
  }

  if (lead.status === 'no_answer' && lead.attempts >= 3) {
    recommendations.push('💬 Try WhatsApp message instead of calling');
  }

  // Engagement recommendations
  if (lead.feedbackHistory?.length === 0) {
    recommendations.push('📝 Add feedback after next contact');
  }

  // Source-based recommendations
  if (lead.leadSource === 'signup' && daysSinceContact === 0) {
    recommendations.push('⚡ Just signed up! Call within 1 hour for best conversion');
  }

  // Priority recommendations
  if (lead.priority === 'high' && total < 70) {
    recommendations.push('🎯 High priority but low score - investigate and re-qualify');
  }

  // Generic high-score recommendation
  if (total >= 80 && lead.status !== 'subscribed') {
    recommendations.push('💰 High-quality lead - prioritize this contact!');
  }

  return recommendations.slice(0, 3); // Return top 3
}

/**
 * Sort leads by score (highest first)
 */
export function sortLeadsByScore(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const scoreA = calculateLeadScore(a).total;
    const scoreB = calculateLeadScore(b).total;
    return scoreB - scoreA;
  });
}

/**
 * Filter leads by rating
 */
export function filterLeadsByRating(leads: Lead[], rating: 'hot' | 'warm' | 'cold'): Lead[] {
  return leads.filter(lead => {
    const score = calculateLeadScore(lead);
    return score.rating === rating;
  });
}

/**
 * Get score badge color
 */
export function getScoreBadgeColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 70) {
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  }
  if (score >= 40) {
    return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
  }
  return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
}

/**
 * Get score icon
 */
export function getScoreIcon(rating: 'hot' | 'warm' | 'cold'): string {
  const icons = {
    hot: '🔥',
    warm: '⚡',
    cold: '❄️',
  };
  return icons[rating];
}
