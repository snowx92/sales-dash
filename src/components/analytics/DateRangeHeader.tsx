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
    <div className="bg-white p-3 rounded-xl shadow-sm">
      {/* Mobile Header */}
      <div className="block lg:hidden space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border flex-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={tempDateRange.from}
              onChange={(e) => onDateChange('from', e.target.value)}
              className="border-none focus:outline-none bg-transparent text-sm w-full"
            />
            <span className="text-gray-500 text-xs">to</span>
            <input
              type="date"
              value={tempDateRange.to}
              onChange={(e) => onDateChange('to', e.target.value)}
              className="border-none focus:outline-none bg-transparent text-sm w-full"
            />
          </div>
          <button 
            onClick={onRefresh} 
            disabled={loading}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          {/* Plan Counters - Compact */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center space-x-1 bg-purple-50 rounded-full px-2 py-1 border border-purple-100">
              <Star className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Starter: {planCountsData.starter}</span>
            </div>
            <div className="flex items-center space-x-1 bg-indigo-50 rounded-full px-2 py-1 border border-indigo-100">
              <Crown className="h-3 w-3 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">Pro: {planCountsData.pro}</span>
            </div>
            <div className="flex items-center space-x-1 bg-pink-50 rounded-full px-2 py-1 border border-pink-100">
              <Rocket className="h-3 w-3 text-pink-600" />
              <span className="text-xs font-medium text-pink-700">Plus: {planCountsData.plus}</span>
            </div>
            <div className="flex items-center space-x-1 bg-green-50 rounded-full px-2 py-1 border border-green-100">
              <UserCheck className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Sales Leads: {planCountsData.trial}</span>
            </div>
            <div className="flex items-center space-x-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
              <UserX className="h-3 w-3 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Assigned Stores: {planCountsData.free}</span>
            </div>
          </div>
          
          {/* Date Picker - Compact */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-md p-2 border">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={tempDateRange.from}
                onChange={(e) => onDateChange('from', e.target.value)}
                className="border-none focus:outline-none bg-transparent text-xs text-gray-700"
              />
              <span className="text-gray-500 text-xs">to</span>
              <input
                type="date"
                value={tempDateRange.to}
                onChange={(e) => onDateChange('to', e.target.value)}
                className="border-none focus:outline-none bg-transparent text-xs text-gray-700"
              />
            </div>
            <button 
              onClick={onRefresh} 
              disabled={loading}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
