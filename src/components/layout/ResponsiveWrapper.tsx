"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
  enableMotion?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const ResponsiveWrapper = ({ 
  children, 
  className = "", 
  enableMotion = true,
  padding = "md"
}: ResponsiveWrapperProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-2 sm:p-4",
    md: "p-4 sm:p-6 lg:p-8",
    lg: "p-6 sm:p-8 lg:p-12"
  };

  const baseClasses = `w-full ${paddingClasses[padding]} ${className}`;

  if (enableMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  cols = { base: 1, sm: 2, lg: 3, xl: 4 },
  gap = 6,
  className = ""
}: ResponsiveGridProps) => {
  const gridClasses = [
    "grid",
    `gap-${gap}`,
    cols.base && `grid-cols-${cols.base}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export const ResponsiveCard = ({ 
  children, 
  className = "",
  padding = "md",
  hover = true
}: ResponsiveCardProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-4 sm:p-6",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10"
  };

  const baseClasses = [
    "bg-white rounded-lg border border-gray-200 shadow-sm",
    paddingClasses[padding],
    hover && "hover:shadow-md transition-shadow duration-200",
    className
  ].filter(Boolean).join(" ");

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={baseClasses}
    >
      {children}
    </motion.div>
  );
};

interface ResponsiveStackProps {
  children: ReactNode;
  space?: number;
  direction?: "vertical" | "horizontal";
  breakpoint?: "sm" | "md" | "lg";
  className?: string;
}

export const ResponsiveStack = ({ 
  children, 
  space = 4,
  direction = "vertical",
  breakpoint = "md",
  className = ""
}: ResponsiveStackProps) => {
  const verticalClasses = `space-y-${space}`;
  
  const directionClasses = direction === "vertical" 
    ? `flex flex-col ${verticalClasses} ${breakpoint}:space-y-0 ${breakpoint}:space-x-${space} ${breakpoint}:flex-row`
    : `flex flex-col ${verticalClasses} ${breakpoint}:space-y-0 ${breakpoint}:space-x-${space} ${breakpoint}:flex-row`;

  return (
    <div className={`${directionClasses} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-first responsive breakpoint hook
export const useResponsiveBreakpoint = () => {
  if (typeof window === 'undefined') return 'lg'; // Default for SSR
  
  const width = window.innerWidth;
  
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  return 'xl';
};

export default ResponsiveWrapper; 