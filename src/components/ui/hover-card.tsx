
import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const HoverCard = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>
>(({ openDelay = 700, closeDelay = 300, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  // On mobile, use longer delays to prevent accidental triggers
  return (
    <HoverCardPrimitive.Root
      openDelay={isMobile ? 1000 : openDelay}
      closeDelay={isMobile ? 500 : closeDelay}
      {...props}
    />
  )
})
HoverCard.displayName = "HoverCard"

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-[8500] rounded-md p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "bg-black/80 backdrop-blur-xl border border-white/10 text-white max-h-[85vh] overflow-y-auto",
        isMobile ? "fixed left-[50%] top-[50%] w-[90vw] max-w-[90vw] -translate-x-1/2 -translate-y-1/2" : "w-72",
        className
      )}
      {...props}
    />
  )
})
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
