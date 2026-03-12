/**
 * Alert component — shadcn/ui-style implementation using Tailwind + cva.
 *
 * Replaces react-bootstrap <Alert bsStyle="..."> across the codebase.
 *
 * Usage:
 *   import { Alert, AlertDescription } from "../ui/alert";
 *
 *   <Alert variant="destructive">
 *     <AlertDescription>Something went wrong.</AlertDescription>
 *   </Alert>
 */
import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva(
  // Base styles — layout, border, padding, rounded corners
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        /** Neutral informational alert */
        default: "bg-white border-[#CCCCCC] text-[#080807]",
        /** Error / danger alert — mirrors Bootstrap's .alert-danger */
        destructive:
          "bg-[#F9E0E1] border-[#D0343A] text-[#97272C] [&_a]:text-[#97272C] [&_a]:underline",
        /** Warning alert */
        warning: "bg-[#FEF9E7] border-[#FEE24A] text-[#7D6608]",
        /** Success alert */
        success: "bg-[#F3F7E6] border-[#008918] text-[#005210]",
        /** Informational alert — uses Palace light blue */
        info: "bg-[#E8F7FB] border-[#46BBE5] text-[#1A6B84]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-1 font-semibold leading-snug", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
