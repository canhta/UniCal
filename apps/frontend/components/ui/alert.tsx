import * as React from "react"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { XMarkIcon } from "@heroicons/react/24/outline"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
        success: "border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600",
        error: "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, dismissible, onDismiss, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
      <div className="text-sm [&_p]:leading-relaxed">
        {children}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Dismiss alert"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
)
Alert.displayName = "Alert"

export { Alert, alertVariants }
