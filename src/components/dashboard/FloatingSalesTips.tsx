"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Lightbulb } from "lucide-react";
import { getRandomTip, type SalesTip } from "@/lib/data/salesTips";

export default function FloatingSalesTips() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<SalesTip>(getRandomTip());
  const [showButton, setShowButton] = useState(true);

  // Show a random tip every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(getRandomTip());
      setIsOpen(true);
      setShowButton(true);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-close the tip after 15 seconds
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        setIsOpen(false);
      }, 15000); // 15 seconds

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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleButtonClick}
            // Small button stacked at bottom-right (stacked with other floating buttons)
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center group"
            aria-label="Show sales tip"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Lightbulb className="w-6 h-6" />
            </motion.div>

            {/* Pulsing ring effect */}
            <span className="absolute inset-0 rounded-full bg-purple-600 opacity-75 animate-ping"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Tip Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            // Keep the tip card anchored near the bottom-right but use a slightly smaller width
            className="fixed bottom-6 right-20 z-50 w-72 sm:w-80"
          >
            <div className="relative overflow-hidden rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-2xl">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800"></div>
              </div>

              {/* Decorative Patterns */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full blur-3xl"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-24 h-24 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-purple-400 rounded-full blur-2xl"></div>
              </div>

              {/* Header */}
              <div className="relative px-5 pt-4 pb-3 border-b border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </motion.div>
                    <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">
                      Sales Tip
                    </h3>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="p-1 rounded-full hover:bg-purple-200 transition-colors text-purple-700"
                    aria-label="Close tip"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="relative px-5 py-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                    className="text-4xl mb-3"
                  >
                    {currentTip.icon}
                  </motion.div>

                  {/* Title */}
                  <h4 className="text-lg font-bold mb-2 text-purple-900">
                    {currentTip.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-purple-800">
                    {currentTip.description}
                  </p>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="relative px-5 py-3 border-t border-purple-200 bg-purple-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-600">
                    {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleButtonClick}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    Next Tip →
                  </motion.button>
                </div>
              </div>

              {/* Progress bar (auto-close indicator) */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-800"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
