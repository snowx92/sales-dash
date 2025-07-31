import { 
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Facebook,
  Instagram,
  TrendingUp,
  Globe,
  User,
  UserCheck
} from "lucide-react";

// TypeScript interfaces
export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  website: string;
  socialUrls: string;
  leadSource: string;
  priority: string;
  status: string;
  attempts: number;
  lastContact: string;
  feedback: string;
  createdAt: string;
  feedbackHistory: Array<{
    id: number;
    message: string;
    date: string;
  }>;
}

export interface UpcomingLead {
  id: number;
  name: string;
  phone: string;
  email: string;
  website: string;
  socialUrls: string;
  leadSource: string;
  priority: string;
  createdAt: string;
}

export interface FormData {
  name: string;
  phone: string;
  email: string;
  website: string;
  socialUrls: string;
  leadSource: string;
  priority: string;
  status: string;
  attempts: number;
  lastContact: string;
  feedback: string;
}

// Lead source options with icons
export const leadSources = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'tiktok', name: 'TikTok', icon: TrendingUp, color: 'text-black' },
  { id: 'web_scraping', name: 'Web Scraping', icon: Globe, color: 'text-green-600' },
  { id: 'personal', name: 'Personal', icon: User, color: 'text-purple-600' },
  { id: 'signup', name: 'Signup', icon: CheckCircle, color: 'text-indigo-600' }
];

// Priority options
export const priorities = [
  { id: 'high', name: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'mid', name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
];

// Status options
export const statuses = [
  { id: 'interested', name: 'Interested', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  { id: 'subscribed', name: 'Subscribed', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: UserCheck },
  { id: 'not_interested', name: 'Not Interested', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  { id: 'no_answer', name: 'No Answer', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: HelpCircle },
  { id: 'follow_up', name: 'Follow Up', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw }
];

// Auto-fill feedback suggestions
export const feedbackSuggestions = [
  "Already has another website solution",
  "Budget constraints - needs cheaper option",
  "Not ready to commit yet",
  "Wants to see more features",
  "Needs to discuss with team",
  "Interested but timing is wrong"
];
