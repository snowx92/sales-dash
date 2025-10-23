"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  Search,
  Plus,
  BarChart,
  Users,
  Home,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: typeof Command;
  shortcut: string;
  action: () => void;
  category: 'navigation' | 'create' | 'view';
}

interface QuickActionBarProps {
  onAddLead?: () => void;
  onSearch?: () => void;
}

// This component now provides just the search trigger and command palette
// It's designed to be embedded in the Navbar
export default function QuickActionBar({ onAddLead, onSearch }: QuickActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      id: 'home',
      name: 'Go to Dashboard',
      description: 'Navigate to overview dashboard',
      icon: Home,
      shortcut: 'Ctrl+H',
      action: () => {
        router.push('/dashboard/overview');
        setIsOpen(false);
      },
      category: 'navigation'
    },
    {
      id: 'leads',
      name: 'Go to Leads',
      description: 'View and manage leads',
      icon: Users,
      shortcut: 'Ctrl+L',
      action: () => {
        router.push('/dashboard/leads');
        setIsOpen(false);
      },
      category: 'navigation'
    },
    {
      id: 'analytics',
      name: 'Go to Analytics',
      description: 'View performance analytics',
      icon: BarChart,
      shortcut: 'Ctrl+A',
      action: () => {
        router.push('/dashboard/analytics');
        setIsOpen(false);
      },
      category: 'navigation'
    },
    {
      id: 'add-lead',
      name: 'Add New Lead',
      description: 'Create a new lead',
      icon: Plus,
      shortcut: 'Ctrl+N',
      action: () => {
        if (onAddLead) {
          onAddLead();
        }
        setIsOpen(false);
      },
      category: 'create'
    },
    {
      id: 'search',
      name: 'Search Leads',
      description: 'Search through all leads',
      icon: Search,
      shortcut: 'Ctrl+K',
      action: () => {
        if (onSearch) {
          onSearch();
        }
        setIsOpen(false);
      },
      category: 'view'
    }
  ];

  const filteredActions = searchQuery
    ? actions.filter(action =>
        action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : actions;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open command palette with Ctrl+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      return;
    }

    // Close on Escape
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    // Handle other shortcuts when palette is closed
    if (!isOpen) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        router.push('/dashboard/overview');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        router.push('/dashboard/leads');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        router.push('/dashboard/analytics');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (onAddLead) onAddLead();
      }
    }
  }, [isOpen, onAddLead, router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const getCategoryColor = (category: QuickAction['category']) => {
    switch (category) {
      case 'navigation':
        return 'text-blue-600 bg-blue-50';
      case 'create':
        return 'text-green-600 bg-green-50';
      case 'view':
        return 'text-purple-600 bg-purple-50';
    }
  };

  return (
    <>
      {/* Search Button for Navbar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full text-gray-500 hover:text-purple-600 focus:outline-none relative transition-colors"
        aria-label="Quick actions"
        title="Quick Actions (Ctrl+K)"
      >
        <Search className="h-5 w-5 sm:h-6 sm:w-6" />
      </motion.button>

      {/* Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
            >
              <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Command className="w-6 h-6" />
                      <h3 className="font-bold text-lg">Quick Actions</h3>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type to search actions..."
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Actions List */}
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {filteredActions.length > 0 ? (
                    <div className="space-y-1">
                      {filteredActions.map((action, index) => {
                        const Icon = action.icon;
                        const colorClass = getCategoryColor(action.category);

                        return (
                          <motion.button
                            key={action.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={action.action}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900 group-hover:text-indigo-600">
                                  {action.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {action.description}
                                </div>
                              </div>
                            </div>
                            <kbd className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-300 font-mono">
                              {action.shortcut}
                            </kbd>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      No actions found for "{searchQuery}"
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↓</kbd>
                        <span>Navigate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">Enter</kbd>
                        <span>Select</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">Esc</kbd>
                        <span>Close</span>
                      </div>
                    </div>
                    <div className="text-gray-500">
                      Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">Ctrl+K</kbd> to toggle
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
