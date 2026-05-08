
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const isMobile = useIsMobile()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-black/60 backdrop-blur-sm border-white/5">
            <div className="grid gap-1 items-center">
              {title && <ToastTitle className="text-xs">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs text-white/70">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className={isMobile ? "bottom-2 right-2 left-2" : "bottom-4 right-4"} />
    </ToastProvider>
  )
}
