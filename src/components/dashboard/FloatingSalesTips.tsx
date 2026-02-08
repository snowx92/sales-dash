"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { getRandomTip, type SalesTip } from "@/lib/data/salesTips";

export default function FloatingSalesTips() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<SalesTip>(getRandomTip());
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(getRandomTip());
      setIsOpen(true);
      setShowButton(true);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        setIsOpen(false);
      }, 15000);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleButtonClick = useCallback(() => {
    setCurrentTip(getRandomTip());
    setIsOpen(true);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {showButton && !isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleButtonClick}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-slate-700 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            aria-label="Show sales tip"
          >
            <Lightbulb className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Tip Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed bottom-6 right-20 z-50 w-72 sm:w-80"
          >
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                    Sales Tip
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                  aria-label="Close tip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 py-3">
                <h4 className="text-sm font-semibold mb-1.5 text-slate-800">
                  {currentTip.title}
                </h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  {currentTip.description}
                </p>
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)}
                </span>
                <button
                  onClick={handleButtonClick}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Next Tip →
                </button>
              </div>

              {/* Auto-close indicator */}
              <motion.div
                className="h-0.5 bg-indigo-500"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 15, ease: "linear" }}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
