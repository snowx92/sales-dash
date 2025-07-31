"use client";

import React from "react";
import { Search } from "lucide-react";
import { statuses } from './types';

interface LeadFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  showStatusFilter?: boolean;
  placeholder?: string;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  showStatusFilter = true,
  placeholder = "Search leads by name, phone, or email..."
}) => {
  const gridCols = showStatusFilter ? "md:grid-cols-4" : "md:grid-cols-3";
  const searchCols = showStatusFilter ? "md:col-span-2" : "md:col-span-2";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {/* Search */}
        <div className={searchCols}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>
    </div>
  );
};
