"use client";

import React from "react";
import { Search, Filter, XCircle, Calendar } from "lucide-react";
import { statuses } from './types';

interface LeadFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  showStatusFilter?: boolean;
  placeholder?: string;
  hideCompletedLeads?: boolean;
  onHideCompletedLeadsChange?: (value: boolean) => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  showStatusFilter = true,
  placeholder = "Search leads by name, phone, or email...",
  hideCompletedLeads,
  onHideCompletedLeadsChange
}) => {
  const gridCols = showStatusFilter ? "lg:grid-cols-6" : "lg:grid-cols-5";
  const searchCols = showStatusFilter ? "lg:col-span-2" : "lg:col-span-2";

  const hasActiveDate = fromDate || toDate;
  const hasActiveStatus = showStatusFilter && !!statusFilter;
  const hasAnyFilter = hasActiveDate || hasActiveStatus || !!searchTerm;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4 text-purple-600" /> Filters
          {hasAnyFilter && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Active</span>
          )}
        </div>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              if (showStatusFilter) onStatusFilterChange("");
              onFromDateChange("");
              onToDateChange("");
            }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-4 w-4" /> Clear All
          </button>
        )}
      </div>
      <div className={`grid grid-cols-1 ${gridCols} gap-3 items-end`}>
        {/* Search */}
        <div className={searchCols}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        <div className="flex flex-col gap-1 lg:col-span-2">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Calendar className="h-3 w-3" /> Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="From"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="To"
            />
          </div>
          {hasActiveDate && (
            <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
              {fromDate && <span className="px-2 py-0.5 bg-gray-100 rounded-full">From: {fromDate}</span>}
              {toDate && <span className="px-2 py-0.5 bg-gray-100 rounded-full">To: {toDate}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Toggle to hide subscribed/not interested leads */}
      {showStatusFilter && onHideCompletedLeadsChange && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <input
            type="checkbox"
            id="hideCompletedLeads"
            checked={hideCompletedLeads || false}
            onChange={(e) => onHideCompletedLeadsChange(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="hideCompletedLeads" className="text-sm text-gray-700 cursor-pointer">
            Hide subscribed and not interested leads
          </label>
        </div>
      )}
    </div>
  );
};
