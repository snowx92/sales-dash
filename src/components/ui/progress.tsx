"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    label?: string // Optional label to display progress percentage
  }
>(({ className, value, label, ...props }, ref) => (
  <div className="flex flex-col items-center space-y-2 w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-3 w-1/2 overflow-hidden rounded-full bg-gray-200", className)} // Reduced height and width
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-purple-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </ProgressPrimitive.Root>
    {label && <span className="text-sm text-gray-600">{label}</span>}
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }