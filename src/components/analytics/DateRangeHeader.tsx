"use client";

import { Calendar, RefreshCw, Star, Crown, Rocket, UserCheck, UserX } from "lucide-react";

interface DateRangeHeaderProps {
  tempDateRange: {
    from: string;
    to: string;
  };
  planCountsData: {
    starter: number;
    pro: number;
    plus: number;
    trial: number;
    free: number;
  };
  loading: boolean;
  onDateChange: (field: 'from' | 'to', value: string) => void;
  onRefresh: () => void;
}

export const DateRangeHeader = ({
  tempDateRange,
  planCountsData,
  loading,
  onDateChange,
  onRefresh
}: DateRangeHeaderProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      {/* Mobile Header */}
      <div className="block lg:hidden space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-2 border border-slate-200 flex-1">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={tempDateRange.from}
              onChange={(e) => onDateChange('from', e.target.value)}
              className="border-none focus:outline-none bg-transparent text-sm w-full text-slate-700"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={tempDateRange.to}
              onChange={(e) => onDateChange('to', e.target.value)}
              className="border-none focus:outline-none bg-transparent text-sm w-full text-slate-700"
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          {/* Plan Counters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center space-x-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <Star className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Starter: {planCountsData.starter}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <Crown className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Pro: {planCountsData.pro}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <Rocket className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Plus: {planCountsData.plus}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <UserCheck className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Sales Leads: {planCountsData.trial}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
              <UserX className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Assigned: {planCountsData.free}</span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={tempDateRange.from}
                onChange={(e) => onDateChange('from', e.target.value)}
                className="border-none focus:outline-none bg-transparent text-xs text-slate-600"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={tempDateRange.to}
                onChange={(e) => onDateChange('to', e.target.value)}
                className="border-none focus:outline-none bg-transparent text-xs text-slate-600"
              />
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
