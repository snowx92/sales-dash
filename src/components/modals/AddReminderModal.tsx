'use client';

import { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import { MyReminderFormData } from '@/lib/types/reminder';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MyReminderFormData) => void;
  entityName: string;
}

export default function AddReminderModal({
  isOpen,
  onClose,
  onSave,
  entityName,
}: AddReminderModalProps) {
  const [formData, setFormData] = useState<MyReminderFormData>({
    date: '',
    note: '',
  });

  const [errors, setErrors] = useState<{ date?: string; note?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { date?: string; note?: string } = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.note.trim()) {
      newErrors.note = 'Note is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ date: '', note: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Reminder</h2>
            <p className="text-sm text-gray-600 mt-1">For: {entityName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Reminder Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Note Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-1" />
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Enter reminder note..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-400 ${
                errors.note ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.note && (
              <p className="text-red-500 text-xs mt-1">{errors.note}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
