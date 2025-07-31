"use client";

import React from "react";
import { Plus, Target, Building } from "lucide-react";

interface EmptyStateProps {
  type: 'leads' | 'upcoming';
  hasFilters: boolean;
  onAddLead?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, hasFilters, onAddLead }) => {
  const isUpcoming = type === 'upcoming';
  const Icon = isUpcoming ? Target : Building;
  
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {isUpcoming ? "No upcoming leads found" : "No leads found"}
      </h3>
      <p className="text-gray-600 mb-4">
        {hasFilters 
          ? "Try adjusting your filters or search terms."
          : isUpcoming 
            ? "No upcoming leads match your current filters."
            : "Get started by adding your first lead."
        }
      </p>
      {!hasFilters && !isUpcoming && onAddLead && (
        <button
          onClick={onAddLead}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Your First Lead
        </button>
      )}
    </div>
  );
};
