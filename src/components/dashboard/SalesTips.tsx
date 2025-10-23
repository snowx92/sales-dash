"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getRandomTip, salesTips, type SalesTip } from "@/lib/data/salesTips";

interface SalesTipsProps {
  autoRotate?: boolean;
  rotateInterval?: number; // in milliseconds
  showNavigation?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function SalesTips({
  autoRotate = true,
  rotateInterval = 15000, // 15 seconds
  showNavigation = true,
  showClose = false,
  onClose,
  className = ""
}: SalesTipsProps) {
  const [currentTip, setCurrentTip] = useState<SalesTip>(getRandomTip());
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleNextTip = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const currentIndex = salesTips.findIndex(tip => tip.id === currentTip.id);
    const nextIndex = (currentIndex + 1) % salesTips.length;

    setTimeout(() => {
      setCurrentTip(salesTips[nextIndex]);
      setIsAnimating(false);
    }, 300);
  }, [currentTip.id, isAnimating]);

  // Auto-rotate tips
  useEffect(() => {
    if (!autoRotate || isPaused) return;

    const interval = setInterval(() => {
      handleNextTip();
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, isPaused, handleNextTip]);

  const handlePreviousTip = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const currentIndex = salesTips.findIndex(tip => tip.id === currentTip.id);
    const prevIndex = currentIndex === 0 ? salesTips.length - 1 : currentIndex - 1;

    setTimeout(() => {
      setCurrentTip(salesTips[prevIndex]);
      setIsAnimating(false);
    }, 300);
  };

  const handleRandomTip = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentTip(getRandomTip());
      setIsAnimating(false);
    }, 300);
  };

  const getCategoryBadge = (category: SalesTip['category']) => {
    const badges = {
      motivation: { label: "Motivation", emoji: "💪" },
      strategy: { label: "Strategy", emoji: "🎯" },
      technique: { label: "Technique", emoji: "🛠️" },
      conversion: { label: "Conversion", emoji: "💰" },
      "follow-up": { label: "Follow-up", emoji: "📞" }
    };
    return badges[category];
  };

  const currentIndex = salesTips.findIndex(tip => tip.id === currentTip.id);
  const badge = getCategoryBadge(currentTip.category);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden rounded-2xl border-2 ${currentTip.color.border} ${currentTip.color.bg} shadow-lg hover:shadow-xl transition-shadow duration-300`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentTip.color.gradient}`}></div>
        </div>

        {/* Decorative Patterns */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentTip.color.gradient} rounded-full blur-3xl`}></div>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentTip.color.gradient} rounded-full blur-2xl`}></div>
        </div>

        {/* Header */}
        <div className="relative px-6 pt-5 pb-3 border-b border-current/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-2xl"
              >
                <Sparkles className={`w-6 h-6 ${currentTip.color.text}`} />
              </motion.div>
              <div>
                <h3 className={`text-sm font-bold ${currentTip.color.text} uppercase tracking-wide`}>
                  Sales Tip of the Moment
                </h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs opacity-60">{badge.emoji}</span>
                  <span className={`text-xs font-medium ${currentTip.color.text} opacity-75`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            {showClose && onClose && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-1.5 rounded-full hover:bg-white/20 transition-colors ${currentTip.color.text}`}
                aria-label="Close tips"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                className="text-5xl mb-4"
              >
                {currentTip.icon}
              </motion.div>

              {/* Title */}
              <h4 className={`text-xl font-bold mb-3 ${currentTip.color.text}`}>
                {currentTip.title}
              </h4>

              {/* Description */}
              <p className={`text-sm leading-relaxed ${currentTip.color.text} opacity-80`}>
                {currentTip.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with Navigation */}
        <div className="relative px-6 py-4 border-t border-current/10">
          <div className="flex items-center justify-between">
            {/* Tip Counter */}
            <div className={`text-xs font-medium ${currentTip.color.text} opacity-60`}>
              Tip {currentIndex + 1} of {salesTips.length}
            </div>

            {/* Navigation Controls */}
            {showNavigation && (
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePreviousTip}
                  disabled={isAnimating}
                  className={`p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTip.color.text}`}
                  aria-label="Previous tip"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>

                {/* Random Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRandomTip}
                  disabled={isAnimating}
                  className={`p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTip.color.text}`}
                  aria-label="Random tip"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>

                {/* Next Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNextTip}
                  disabled={isAnimating}
                  className={`p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTip.color.text}`}
                  aria-label="Next tip"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Auto-rotate indicator */}
          {autoRotate && !isPaused && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: rotateInterval / 1000, ease: "linear" }}
              key={currentTip.id}
            />
          )}
        </div>
      </motion.div>

      {/* Pause indicator */}
      <AnimatePresence>
        {isPaused && autoRotate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm"
          >
            Paused
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
