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
  MessageCircle,
  CheckCircle,
  Trash2,
  CalendarDays
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ApiLead } from "@/lib/api/leads/types";
import { EndedSubscriptionItem } from "@/lib/api/retention/types";
import { leadsService } from "@/lib/api/leads/leadsService";
import { retentionService } from "@/lib/api/retention/retentionService";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { formatPhoneForDisplay } from "@/lib/utils/phone";
import { reminderStorage } from "@/lib/utils/reminderStorage";
import type { MyReminder } from "@/lib/types/reminder";
import { toast } from "sonner";

interface SmartReminderItem {
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
  const [activeTab, setActiveTab] = useState<'my' | 'smart'>('my');

  // My Reminders state
  const [myReminders, setMyReminders] = useState<MyReminder[]>([]);
  const [filteredMyReminders, setFilteredMyReminders] = useState<MyReminder[]>([]);
  const [myReminderSearch, setMyReminderSearch] = useState("");
  const [myReminderTypeFilter, setMyReminderTypeFilter] = useState<'all' | 'lead' | 'retention'>('all');

  // Smart Reminders state
  const [smartReminders, setSmartReminders] = useState<SmartReminderItem[]>([]);
  const [filteredSmartReminders, setFilteredSmartReminders] = useState<SmartReminderItem[]>([]);
  const [smartReminderSearch, setSmartReminderSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'lead' | 'retention'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);

  // Load My Reminders from session storage
  const loadMyReminders = useCallback(() => {
    const reminders = reminderStorage.getAll();
    setMyReminders(reminders);
    setFilteredMyReminders(reminders);
  }, []);

  // Load Smart Reminders (existing logic)
  const loadSmartReminders = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const newReminders: SmartReminderItem[] = [];

      // Load leads
      const leadsResponse = await leadsService.getLeads({ page: 1, limit: 500 });
      if (leadsResponse?.items) {
        leadsResponse.items.forEach((apiLead: ApiLead) => {
          const leadId = String(apiLead.id);

          if (dismissedIds.has(leadId) || apiLead.status === 'NOT_INTERSTED' || apiLead.status === 'SUBSCRIBED') {
            return;
          }

          const lastContactTs: unknown = apiLead.updatedAt?._seconds ? apiLead.updatedAt : apiLead.createdAt;

          function convertToDate(ts: unknown): Date {
            if (ts == null) return new Date(0);

            if (typeof ts === 'number') {
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

              if ('toDate' in obj && typeof obj.toDate === 'function') {
                const maybeToDate = obj.toDate;
                return (maybeToDate as () => Date)();
              }
            }

            return new Date(0);
          }

          const lastContactDate = convertToDate(lastContactTs);
          const daysSince = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));

          let urgency: 'critical' | 'high' | 'medium' = 'medium';
          let message = '';

          if (daysSince >= 14) {
            urgency = 'critical';
            message = `No contact for ${daysSince} days! Urgent follow-up needed.`;
          } else if (daysSince >= 7) {
            urgency = 'high';
            message = `Follow-up needed (${daysSince} days since contact).`;
          } else if (apiLead.status === 'INTERSTED' && daysSince >= 3) {
            urgency = 'medium';
            message = `Interested lead - follow up to maintain momentum.`;
          } else if (apiLead.status === 'FOLLOW_UP' && daysSince >= 5) {
            urgency = 'medium';
            message = `Follow-up task pending (${daysSince} days).`;
          } else {
            return;
          }

          newReminders.push({
            id: leadId,
            type: 'lead',
            name: apiLead.name,
            phone: apiLead.phone,
            email: apiLead.email || '',
            website: apiLead.websiteUrl || '',
            priority: apiLead.priority === 'HIGH' ? 'high' : apiLead.priority === 'MEDIUM' ? 'mid' : 'low',
            daysSinceContact: daysSince,
            urgency,
            message,
            lastContact: lastContactDate.toLocaleDateString(),
            status: apiLead.status,
            attempts: apiLead.attemps || 0,
            originalData: apiLead
          });
        });
      }

      // Load retention merchants (wrapped in try-catch to handle errors gracefully)
      try {
        const retentionResponse = await retentionService.getEndedSubscriptions({ pageNo: 1, limit: 500 });
        if (retentionResponse?.items) {
        retentionResponse.items.forEach((merchant: EndedSubscriptionItem) => {
          const merchantId = `retention_${merchant.id}`;

          if (dismissedIds.has(merchantId)) {
            return;
          }

          // Handle expiredAt which can be string, null, or Firestore timestamp
          let expiredDate: Date;
          if (!merchant.expiredAt) {
            return; // Skip if no expiration date
          }

          if (typeof merchant.expiredAt === 'object' && '_seconds' in merchant.expiredAt) {
            expiredDate = new Date(merchant.expiredAt._seconds * 1000);
          } else {
            expiredDate = new Date(merchant.expiredAt);
          }

          const daysSince = Math.floor((now.getTime() - expiredDate.getTime()) / (1000 * 60 * 60 * 24));

          let urgency: 'critical' | 'high' | 'medium' = 'medium';
          let message = '';

          if (daysSince >= 30) {
            urgency = 'critical';
            message = `Subscription ended ${daysSince} days ago! Critical re-engagement needed.`;
          } else if (daysSince >= 14) {
            urgency = 'high';
            message = `Win-back opportunity (${daysSince} days since expiration).`;
          } else if (daysSince >= 7) {
            urgency = 'medium';
            message = `Recent churn - good time to reconnect.`;
          } else {
            return;
          }

          newReminders.push({
            id: merchantId,
            type: 'retention',
            name: merchant.storeName || merchant.name,
            phone: merchant.phone,
            email: merchant.email,
            website: merchant.link || '',
            priority: merchant.priority === 'HIGH' ? 'high' : merchant.priority === 'MEDIUM' ? 'mid' : 'low',
            daysSinceContact: daysSince,
            urgency,
            message,
            lastContact: expiredDate.toLocaleDateString(),
            status: 'expired',
            originalData: merchant
          });
        });
        }
      } catch (retentionError) {
        console.warn('Could not load retention data for smart reminders:', retentionError);
        // Continue without retention data
      }

      newReminders.sort((a, b) => {
        const urgencyOrder = { critical: 3, high: 2, medium: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return b.daysSinceContact - a.daysSinceContact;
      });

      setSmartReminders(newReminders);
      setFilteredSmartReminders(newReminders);
    } catch (error) {
      console.error('Error loading smart reminders:', error);
      toast.error('Failed to load smart reminders');
    } finally {
      setLoading(false);
    }
  }, [dismissedIds]);

  useEffect(() => {
    loadMyReminders();
    loadSmartReminders();

    // Load dismissed IDs from localStorage
    const stored = localStorage.getItem('dismissedReminders');
    if (stored) {
      setDismissedIds(new Set(JSON.parse(stored)));
    }
  }, [loadMyReminders, loadSmartReminders]);

  // Filter My Reminders
  useEffect(() => {
    let filtered = myReminders;

    if (myReminderSearch) {
      const term = myReminderSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.entityName.toLowerCase().includes(term) ||
        r.entityEmail?.toLowerCase().includes(term) ||
        r.entityPhone?.includes(term) ||
        r.note.toLowerCase().includes(term)
      );
    }

    if (myReminderTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === myReminderTypeFilter);
    }

    setFilteredMyReminders(filtered);
  }, [myReminders, myReminderSearch, myReminderTypeFilter]);

  // Filter Smart Reminders
  useEffect(() => {
    let filtered = smartReminders;

    if (smartReminderSearch) {
      const term = smartReminderSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.phone.includes(term) ||
        r.website.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }

    setFilteredSmartReminders(filtered);
  }, [smartReminders, smartReminderSearch, typeFilter, urgencyFilter]);

  const handleToggleComplete = (id: string) => {
    reminderStorage.toggleComplete(id);
    loadMyReminders();
    toast.success('Reminder status updated');
  };

  const handleDeleteReminder = (id: string) => {
    reminderStorage.delete(id);
    loadMyReminders();
    toast.success('Reminder deleted');
  };

  const handleDismissSmartReminder = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedReminders', JSON.stringify([...newDismissed]));

    setFilteredSmartReminders(prev => prev.filter(r => r.id !== id));
    toast.success('Reminder dismissed');
  };

  const getUrgencyColor = (urgency: 'critical' | 'high' | 'medium') => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusColor = (completed: boolean) => {
    return completed ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-200';
  };

  const formatReminderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(date);
    reminderDate.setHours(0, 0, 0, 0);

    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-600 font-semibold">Overdue</span>;
    if (diffDays === 0) return <span className="text-orange-600 font-semibold">Today</span>;
    if (diffDays === 1) return <span className="text-yellow-600 font-semibold">Tomorrow</span>;
    return <span className="text-gray-600">{date.toLocaleDateString()}</span>;
  };

  // Stats for My Reminders
  const myReminderStats = {
    total: myReminders.length,
    pending: myReminders.filter(r => !r.completed).length,
    completed: myReminders.filter(r => r.completed).length,
    overdue: myReminders.filter(r => {
      const date = new Date(r.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !r.completed && date < today;
    }).length,
    today: myReminders.filter(r => {
      const date = new Date(r.date);
      const today = new Date();
      return !r.completed &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    }).length,
    upcoming: myReminders.filter(r => {
      const date = new Date(r.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !r.completed && date > today;
    }).length
  };

  // Stats for Smart Reminders
  const smartReminderStats = {
    total: smartReminders.length,
    critical: smartReminders.filter(r => r.urgency === 'critical').length,
    high: smartReminders.filter(r => r.urgency === 'high').length,
    medium: smartReminders.filter(r => r.urgency === 'medium').length,
    leads: smartReminders.filter(r => r.type === 'lead').length,
    retention: smartReminders.filter(r => r.type === 'retention').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
            <p className="text-gray-600 mt-1">Manage your follow-ups and smart suggestions</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'my' | 'smart')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <TabsTrigger
              value="my"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all
                data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
            >
              <CalendarDays className="h-4 w-4" />
              My Reminders
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {myReminderStats.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="smart"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all
                data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800"
            >
              <Bell className="h-4 w-4" />
              Smart Reminders
              <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {smartReminderStats.critical + smartReminderStats.high}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* My Reminders Tab */}
          <TabsContent value="my" className="space-y-6">
            {/* My Reminders Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{myReminderStats.total}</p>
                  </div>
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 uppercase">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{myReminderStats.overdue}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 uppercase">Today</p>
                    <p className="text-2xl font-bold text-orange-600">{myReminderStats.today}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-600 uppercase">Upcoming</p>
                    <p className="text-2xl font-bold text-yellow-600">{myReminderStats.upcoming}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 uppercase">Pending</p>
                    <p className="text-2xl font-bold text-blue-600">{myReminderStats.pending}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 uppercase">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{myReminderStats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search my reminders..."
                    value={myReminderSearch}
                    onChange={(e) => setMyReminderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={myReminderTypeFilter}
                  onChange={(e) => setMyReminderTypeFilter(e.target.value as 'all' | 'lead' | 'retention')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="lead">Leads Only</option>
                  <option value="retention">Retention Only</option>
                </select>
              </div>
            </div>

            {/* My Reminders List */}
            <div className="space-y-3">
              {loading && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your reminders...</p>
                </div>
              )}

              {!loading && filteredMyReminders.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reminders Yet</h3>
                  <p className="text-gray-500">
                    {myReminderSearch ? 'No reminders match your search.' : 'Create reminders from leads or retention pages.'}
                  </p>
                </div>
              )}

              {!loading && filteredMyReminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border shadow-sm p-6 ${getStatusColor(reminder.completed)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => handleToggleComplete(reminder.id)}
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            reminder.completed
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {reminder.completed && <CheckCircle className="h-4 w-4 text-white" />}
                        </button>
                        <h3 className={`text-lg font-semibold ${reminder.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {reminder.entityName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reminder.type === 'lead' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {reminder.type === 'lead' ? 'Lead' : 'Retention'}
                        </span>
                      </div>

                      <p className={`mb-3 ${reminder.completed ? 'text-gray-400' : 'text-gray-700'}`}>{reminder.note}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {formatReminderDate(reminder.date)}
                        </div>
                        {reminder.entityPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {formatPhoneForDisplay(reminder.entityPhone)}
                          </div>
                        )}
                        {reminder.entityEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {reminder.entityEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {reminder.entityPhone && (
                        <button
                          onClick={() => window.open(buildWhatsAppUrl(reminder.entityPhone, ''), '_blank')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Smart Reminders Tab */}
          <TabsContent value="smart" className="space-y-6">
            {/* Smart Reminders Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{smartReminderStats.total}</p>
                  </div>
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 uppercase">Critical</p>
                    <p className="text-2xl font-bold text-red-600">{smartReminderStats.critical}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 uppercase">High</p>
                    <p className="text-2xl font-bold text-orange-600">{smartReminderStats.high}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-600 uppercase">Medium</p>
                    <p className="text-2xl font-bold text-yellow-600">{smartReminderStats.medium}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 uppercase">Leads</p>
                    <p className="text-2xl font-bold text-blue-600">{smartReminderStats.leads}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 uppercase">Retention</p>
                    <p className="text-2xl font-bold text-green-600">{smartReminderStats.retention}</p>
                  </div>
                  <Building className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reminders..."
                    value={smartReminderSearch}
                    onChange={(e) => setSmartReminderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lead' | 'retention')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="lead">Leads Only</option>
                  <option value="retention">Retention Only</option>
                </select>

                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value as 'all' | 'critical' | 'high' | 'medium')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Urgency</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
            </div>

            {/* Smart Reminders List */}
            <div className="space-y-3">
              {loading && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading smart reminders...</p>
                </div>
              )}

              {!loading && filteredSmartReminders.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Smart Reminders</h3>
                  <p className="text-gray-500">All caught up! No urgent follow-ups at the moment.</p>
                </div>
              )}

              {!loading && filteredSmartReminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border shadow-sm p-6 ${getUrgencyColor(reminder.urgency)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{reminder.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reminder.type === 'lead' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {reminder.type === 'lead' ? 'Lead' : 'Retention'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                          reminder.urgency === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : reminder.urgency === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reminder.urgency}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{reminder.message}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last contact: {reminder.lastContact}
                        </div>
                        {reminder.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {formatPhoneForDisplay(reminder.phone)}
                          </div>
                        )}
                        {reminder.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {reminder.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`tel:${reminder.phone}`, '_self')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call"
                      >
                        <Phone className="h-5 w-5" />
                      </button>
                      {reminder.phone && (
                        <button
                          onClick={() => window.open(buildWhatsAppUrl(reminder.phone, ''), '_blank')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const path = reminder.type === 'lead' ? '/dashboard/leads' : '/dashboard/retention';
                          router.push(path);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDismissSmartReminder(reminder.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Dismiss"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
