
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);

  // If src is undefined, null, or empty string, or there's an error loading the image,
  // let the fallback component handle it
  const shouldUseImage = !hasError && src && typeof src === 'string' && src.trim() !== '';
  
  // For ui-avatars.com URLs, ensure they're properly formatted
  // This could be causing the issue if the URL is malformed
  let processedSrc = src;
  if (shouldUseImage && typeof src === 'string' && src.includes('ui-avatars.com')) {
    try {
      // Ensure the URL is properly encoded
      const url = new URL(src);
      processedSrc = url.toString();
    } catch {
      // If URL parsing fails, don't use the image
      setHasError(true);
    }
  }
  
  return shouldUseImage ? (
    <AvatarPrimitive.Image
      ref={ref}
      src={processedSrc}
      className={cn("aspect-square h-full w-full", className)}
      onError={() => setHasError(true)}
      {...props}
    />
  ) : null;
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-yellow-400",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }