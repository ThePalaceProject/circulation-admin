/* eslint-disable */
/**
 * Button component.
 *
 * Styled with Palace semantic Tailwind tokens (bg-primary, bg-destructive, etc.)
 * defined in theme.scss and tailwind.config.js.
 *
 * Props:
 *   content    — button label (ReactNode or string)
 *   callback   — click handler (alias for onClick)
 *   onClick    — standard click handler
 *   mouseDown  — bind handler to onMouseDown instead of onClick
 *   className  — space-separated modifier tokens (see TOKEN_MAP below)
 *   disabled, type, title, aria-* — passed straight through
 */
import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Maps the legacy modifier class tokens to Tailwind utility classes.
 * Colors use the Palace semantic tokens defined in theme.scss / tailwind.config.js.
 */
const TOKEN_MAP: Record<string, string> = {
  // Colour variants
  inverted:
    "bg-white text-primary border border-primary " +
    "hover:bg-primary hover:text-primary-foreground hover:border-primary",
  danger: "bg-destructive text-white hover:bg-destructive/80",
  success: "bg-accent text-white hover:bg-accent/80",
  transparent:
    "bg-transparent text-foreground font-normal p-0 border-transparent " +
    "hover:bg-transparent hover:text-foreground hover:border-transparent",
  // Sizes
  small: "text-sm",
  big: "text-lg",
  // Margin / alignment  (remove the default m-2)
  "left-align": "ml-0",
  "right-align": "mr-0",
  "top-align": "mt-0",
  "bottom-align": "mb-0",
  // Display
  inline: "inline-flex items-center",
  centered: "mx-auto w-[25vw] text-[1.8vw] border border-primary",
  // Border radius
  squared: "rounded-none",
  "bottom-squared": "rounded-tl rounded-tr rounded-bl-none rounded-br-none",
};

function resolveModifierClasses(className?: string): string {
  if (!className) return "";
  return className
    .split(" ")
    .filter(Boolean)
    .map((token) => {
      const tw = TOKEN_MAP[token];
      // Keep the original token as a class for CSS-class-selector compatibility,
      // then append the Tailwind equivalents (if any).
      return tw ? `${token} ${tw}` : token;
    })
    .join(" ");
}

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "content" | "onClick"
  > {
  /** The button label — accepts string or ReactNode */
  content?: React.ReactNode;
  /** Click handler (alias for standard onClick) */
  callback?: (e?: any) => void;
  /** Standard onClick handler */
  onClick?: (e?: any) => void;
  /** When true the handler is bound to onMouseDown instead of onClick */
  mouseDown?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      content,
      callback,
      onClick,
      mouseDown,
      className,
      type = "button",
      children,
      ...rest
    },
    ref
  ) => {
    const handler = callback ?? onClick;
    const eventProps = mouseDown
      ? { onMouseDown: handler as React.MouseEventHandler<HTMLButtonElement> }
      : { onClick: handler as React.MouseEventHandler<HTMLButtonElement> };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          // Base — Palace primary blue (--primary from theme.scss)
          "btn inline-flex items-center justify-center text-primary-foreground bg-primary m-2 rounded text-base px-3 py-1.5 font-bold min-h-6",
          "transition-colors duration-150",
          "hover:bg-primary/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-50",
          // Resolved modifier classes override base styles via tailwind-merge
          resolveModifierClasses(className)
        )}
        {...eventProps}
        {...rest}
      >
        {content ?? children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export default Button;
