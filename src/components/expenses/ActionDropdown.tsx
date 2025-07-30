'use client';

import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActionDropdown({ onEdit, onDelete }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
        aria-label="More actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 overflow-hidden"
          >
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 transition-colors focus:outline-none focus:bg-gray-50"
            >
              <Pencil className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Edit</span>
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-3 transition-colors focus:outline-none focus:bg-red-50"
            >
              <Trash className="w-4 h-4 text-red-600" />
              <span className="font-medium">Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 