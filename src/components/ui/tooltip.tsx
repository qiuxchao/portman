"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

interface TooltipProps {
  children: React.ReactNode
}

function Tooltip({ children }: TooltipProps) {
  return <>{children}</>
}

function TooltipTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean }) {
  return (
    <span data-slot="tooltip-trigger" {...props}>
      {children}
    </span>
  )
}

function TooltipContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tooltip-content"
      className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block w-max max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
