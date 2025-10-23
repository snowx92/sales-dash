"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  Users,
  Building,
  Search,
  MessageCircle
} from "lucide-react";

import type { ApiLead } from "@/lib/api/leads/types";
import { EndedSubscriptionItem } from "@/lib/api/retention/types";
import { leadsService } from "@/lib/api/leads/leadsService";
import { retentionService } from "@/lib/api/retention/retentionService";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { formatPhoneForDisplay } from "@/lib/utils/phone";

interface ReminderItem {
  id: string;
  type: 'lead' | 'retention';
  name: string;
  phone: string;
  email: string;
  website: string;
  priority: 'high' | 'mid' | 'low';
  daysSinceContact: number;
  urgency: 'critical' | 'high' | 'medium';
  message: string;
  lastContact: string;
  status?: string;
  attempts?: number;
  originalData: ApiLead | EndedSubscriptionItem | unknown;
}

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'lead' | 'retention'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Make loadReminders stable so we can call it from effects
  const loadReminders = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const newReminders: ReminderItem[] = [];

      // Load leads (api fields: websiteUrl, createdAt/updatedAt as timestamps, attemps)
      const leadsResponse = await leadsService.getLeads({ page: 1, limit: 500 });
      if (leadsResponse?.items) {
        leadsResponse.items.forEach((apiLead: ApiLead) => {
          const leadId = String(apiLead.id);

          // Skip if dismissed or already not interested/subscribed
          if (dismissedIds.has(leadId) || apiLead.status === 'NOT_INTERSTED' || apiLead.status === 'SUBSCRIBED') {
            return;
          }

          // Determine last contact from updatedAt (fallback to createdAt)
          const lastContactTs: unknown = apiLead.updatedAt?._seconds ? apiLead.updatedAt : apiLead.createdAt;

          // Convert a few possible timestamp shapes to a Date in a type-safe way:
          // - Firestore-like { _seconds: number } or { seconds: number }
          // - an object with toDate()
          // - numeric epoch seconds or milliseconds
          // - ISO string
          function convertToDate(ts: unknown): Date {
            if (ts == null) return new Date(0);

            if (typeof ts === 'number') {
              // Treat plain numbers as seconds if small, otherwise milliseconds
              return ts > 1e12 ? new Date(ts) : new Date(ts * 1000);
            }

            if (typeof ts === 'string') {
              return new Date(ts);
            }

            if (typeof ts === 'object' && ts !== null) {
              const obj = ts as Record<string, unknown>;

              if ('_seconds' in obj && typeof obj._seconds === 'number') {
                return new Date(obj._seconds * 1000);
              }

              if ('seconds' in obj && typeof obj.seconds === 'number') {
                return new Date((obj.seconds as number) * 1000);
              }

              const maybeToDate = obj['toDate'];
              if (typeof maybeToDate === 'function') {
                return (maybeToDate as () => Date)();
              }
            }

            // Fallback
            return new Date(0);
          }

          const lastContact = convertToDate(lastContactTs);
          const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

          let urgency: 'critical' | 'high' | 'medium' | null = null;
          let message = '';

          if (daysSinceContact >= 14) {
            urgency = 'critical';
            message = `No contact in ${daysSinceContact} days - Risk of losing this lead!`;
          } else if (daysSinceContact >= 7) {
            urgency = 'high';
            message = `Follow up needed - ${daysSinceContact} days since last contact`;
          } else if (apiLead.status === 'INTERSTED' && daysSinceContact >= 3) {
            urgency = 'medium';
            message = `Interested lead - Strike while hot! (${daysSinceContact} days ago)`;
          } else if (apiLead.status === 'FOLLOW_UP' && daysSinceContact >= 5) {
            urgency = 'medium';
            message = `Scheduled follow-up overdue by ${daysSinceContact - 3} days`;
          }

          if (urgency) {
            const priorityMap: { [key: string]: 'high' | 'mid' | 'low' } = {
              'HIGH': 'high',
              'MEDIUM': 'mid',
              'LOW': 'low'
            };

            newReminders.push({
              id: `lead-${leadId}`,
              type: 'lead',
              name: apiLead.name || 'Unknown',
              phone: apiLead.phone || '',
              email: apiLead.email || '',
              website: apiLead.websiteUrl || '',
              priority: priorityMap[apiLead.priority] || 'mid',
              daysSinceContact,
              urgency,
              message,
              lastContact: lastContact.toISOString(),
              status: apiLead.status,
              attempts: apiLead.attemps || 0,
              originalData: apiLead
            });
          }
        });
      }

      // Load retention items (service returns EndedSubscriptionsData with items array)
      const retentionResponse = await retentionService.getEndedSubscriptions({ limit: 500, pageNo: 1 });
      if (retentionResponse?.items) {
        retentionResponse.items.forEach((item: EndedSubscriptionItem) => {
          const retentionId = `retention-${item.id}`;

          if (dismissedIds.has(retentionId)) return;

          // Convert expiredAt to Date
          let expiredDate = new Date();
          if (item.expiredAt) {
            if (typeof item.expiredAt === 'string') expiredDate = new Date(item.expiredAt);
            else if (typeof item.expiredAt === 'object' && '_seconds' in item.expiredAt) expiredDate = new Date(item.expiredAt._seconds * 1000);
          }

          const daysSinceExpired = Math.floor((now.getTime() - expiredDate.getTime()) / (1000 * 60 * 60 * 24));

          let urgency: 'critical' | 'high' | 'medium' = 'medium';
          let message = '';

          if (daysSinceExpired >= 30) {
            urgency = 'critical';
            message = `Subscription expired ${daysSinceExpired} days ago - Urgent re-engagement needed!`;
          } else if (daysSinceExpired >= 14) {
            urgency = 'high';
            message = `Subscription expired ${daysSinceExpired} days ago - Follow up soon`;
          } else if (daysSinceExpired >= 7) {
            urgency = 'medium';
            message = `Subscription expired ${daysSinceExpired} days ago - Good time to reach out`;
          } else {
            return;
          }

          const priorityMap: { [key: string]: 'high' | 'mid' | 'low' } = { 'HIGH': 'high', 'MEDIUM': 'mid', 'LOW': 'low' };

          newReminders.push({
            id: retentionId,
            type: 'retention',
            name: item.name || 'Unknown',
            phone: item.phone || '',
            email: item.email || '',
            website: item.storeName || '',
            priority: priorityMap[item.priority] || 'mid',
            daysSinceContact: daysSinceExpired,
            urgency,
            message,
            lastContact: expiredDate.toISOString(),
            attempts: item.attemps || 0,
            originalData: item
          });
        });
      }

      // Sort by urgency and days
      newReminders.sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2 };
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        return b.daysSinceContact - a.daysSinceContact;
      });

      setReminders(newReminders);
    } catch (err) {
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [dismissedIds]);

  useEffect(() => {
    // Load dismissed reminders from localStorage
    const stored = localStorage.getItem('dismissedReminders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDismissedIds(new Set(parsed));
      } catch (err) {
        console.warn('Failed to parse dismissed reminders', err);
      }
    }

    loadReminders();
  }, [loadReminders]);

  useEffect(() => {
    // Apply filters
    let filtered = reminders;

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.email.toLowerCase().includes(search) ||
        r.phone.includes(search) ||
        r.website.toLowerCase().includes(search)
      );
    }

    setFilteredReminders(filtered);
  }, [reminders, typeFilter, urgencyFilter, searchTerm]);

  

  function handleDismiss(id: string) {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedReminders', JSON.stringify([...newDismissed]));
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  function handleViewDetails(reminder: ReminderItem) {
    if (reminder.type === 'lead') {
      router.push('/dashboard/leads');
    } else {
      router.push('/dashboard/retention');
    }
  }

  function getUrgencyColor(urgency: 'critical' | 'high' | 'medium') {
    switch (urgency) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-300',
          dot: 'bg-red-500',
          badge: 'bg-red-100 text-red-700'
        };
      case 'high':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-300',
          dot: 'bg-orange-500',
          badge: 'bg-orange-100 text-orange-700'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-300',
          dot: 'bg-yellow-500',
          badge: 'bg-yellow-100 text-yellow-700'
        };
    }
  }

  const stats = {
    total: reminders.length,
    critical: reminders.filter(r => r.urgency === 'critical').length,
    high: reminders.filter(r => r.urgency === 'high').length,
    medium: reminders.filter(r => r.urgency === 'medium').length,
    leads: reminders.filter(r => r.type === 'lead').length,
    retention: reminders.filter(r => r.type === 'retention').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-7 h-7 text-orange-600" />
              Smart Reminders
            </h1>
            <p className="text-gray-600 mt-1">Follow-ups needed for leads and retention</p>
          </div>
          <button
            onClick={loadReminders}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">High</p>
                <p className="text-2xl font-bold text-orange-700">{stats.high}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.medium}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Leads</p>
                <p className="text-2xl font-bold text-blue-700">{stats.leads}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Retention</p>
                <p className="text-2xl font-bold text-green-700">{stats.retention}</p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as 'all' | 'lead' | 'retention')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="lead">Leads Only</option>
              <option value="retention">Retention Only</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUrgencyFilter(e.target.value as 'all' | 'critical' | 'high' | 'medium')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Urgency</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
            </select>
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reminders...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No reminders found</p>
              <p className="text-gray-500 text-sm mt-1">All caught up! 🎉</p>
            </div>
          ) : (
            filteredReminders.map((reminder, index) => {
              const colors = getUrgencyColor(reminder.urgency);

              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl border-2 ${colors.border} shadow-sm hover:shadow-md transition-all p-6`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`w-3 h-3 rounded-full ${colors.dot} animate-pulse`}></span>
                        <h3 className="font-bold text-lg text-gray-900">{reminder.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                          {reminder.urgency.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reminder.type === 'lead' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {reminder.type === 'lead' ? 'LEAD' : 'RETENTION'}
                        </span>
                      </div>

                      {/* Message */}
                      <p className={`text-sm ${colors.text} font-medium mb-4`}>
                        {reminder.message}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium text-green-600">{formatPhoneForDisplay(reminder.phone)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{reminder.email}</span>
                        </div>
                        {reminder.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ExternalLink className="w-4 h-4" />
                            <span>{reminder.website}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Last contact: {new Date(reminder.lastContact).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => window.open(`tel:${reminder.phone}`, '_self')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                        <button
                          onClick={() => {
                            const url = buildWhatsAppUrl(reminder.phone, 'Hello');
                            window.open(url, '_blank');
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleViewDetails(reminder)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleDismiss(reminder.id)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
