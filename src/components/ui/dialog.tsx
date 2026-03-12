/* eslint-disable */
/**
 * Dialog component — shadcn/ui-style implementation using Tailwind.
 *
 * Replaces react-bootstrap <Modal> across the codebase.
 * Matches the Bootstrap Modal API closely to minimise consuming-file changes:
 *   - <Dialog show onHide={fn} className="...">
 *   - <Dialog.Header closeButton>
 *   - <Dialog.Title>
 *   - <Dialog.Body>
 *   - <Dialog.Footer>
 */
import * as React from "react";
import { cn } from "../../lib/utils";

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controls visibility */
  show: boolean;
  /** Called when the user clicks the backdrop or presses Escape */
  onHide: () => void;
}

const DialogRoot = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ show, onHide, className, children, ...props }, ref) => {
    // Close on Escape key
    React.useEffect(() => {
      if (!show) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onHide();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [show, onHide]);

    if (!show) return null;

    return (
      /* Backdrop */
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onHide}
      >
        {/* role="document" wrapper — required for Bootstrap-compatible modal tests */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-50 w-full max-w-lg rounded-lg bg-white shadow-xl",
            "mx-4 my-8",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          <div role="document" className="modal-dialog">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
DialogRoot.displayName = "Dialog";

/* ---- Header ---- */
export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders a close (×) button in the top-right corner */
  closeButton?: boolean;
  onHide?: () => void;
}

/** Must be a direct child of Dialog to get the onHide callback via context. */
const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, closeButton, onHide, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-start justify-between border-b border-[#CCCCCC] px-6 py-4",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {closeButton && (
        <button
          type="button"
          aria-label="Close"
          onClick={onHide}
          className="ml-4 text-gray-500 hover:text-gray-800 focus:outline-none text-xl leading-none"
        >
          &times;
        </button>
      )}
    </div>
  )
);
DialogHeader.displayName = "DialogHeader";

/* ---- Title ---- */
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("text-lg font-semibold text-[#080807]", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

/* ---- Body ---- */
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("modal-body px-6 py-4 text-sm text-[#080807]", className)}
    {...props}
  />
));
DialogBody.displayName = "DialogBody";

/* ---- Footer ---- */
const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex justify-end gap-2 border-t border-[#CCCCCC] px-6 py-4",
      className
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

/* ---- Namespace export (mirrors Bootstrap Modal.Header etc.) ---- */
type DialogComponent = typeof DialogRoot & {
  Header: typeof DialogHeader;
  Title: typeof DialogTitle;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
};

const Dialog = DialogRoot as DialogComponent;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export { Dialog };
export default Dialog;
