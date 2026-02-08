"use client";

import React from "react";
import { List, LayoutGrid } from "lucide-react";

export type ViewMode = "list" | "board";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
      <button
        onClick={() => onViewModeChange("list")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode === "list"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </button>
      <button
        onClick={() => onViewModeChange("board")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode === "board"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Board</span>
      </button>
    </div>
  );
};
