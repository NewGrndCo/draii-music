
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={1000} // Reduced duration
      position="bottom-right"
      closeButton
      richColors
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black/60 group-[.toaster]:text-white group-[.toaster]:border-white/5 group-[.toaster]:shadow-sm group-[.toaster]:backdrop-blur-sm group-[.toaster]:rounded-md group-[.toaster]:p-1.5",
          title: "group-[.toast]:text-xs group-[.toast]:font-medium",
          description: "group-[.toast]:text-xs group-[.toast]:text-white/70",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
