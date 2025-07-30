'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Tag } from '@/lib/api/expense/tags/TagService';
import { getUniqueColor } from '@/helpers/helpers';

interface ColoredSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Tag[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function ColoredSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = ''
}: ColoredSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.id === value);
  const { backgroundColor, textColor } = selectedOption ? getUniqueColor(selectedOption.name) : { backgroundColor: '#E5E7EB', textColor: '#374151' };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor }}
          />
          <span style={{ color: textColor }}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const { backgroundColor, textColor } = getUniqueColor(option.name);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 ${
                  value === option.id ? 'bg-blue-50' : ''
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor }}
                />
                <span style={{ color: textColor }}>
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 