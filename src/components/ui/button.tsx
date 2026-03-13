/* eslint-disable */
/**
 * Button component — drop-in replacement for library-simplified-reusable-components Button.
 *
 * Accepts the same prop API so all consuming files only need an import path change:
 *   import { Button } from "../ui/button";
 *   import { Button } from "../ui";         // via barrel
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
 * Maps the legacy modifier class tokens from library-simplified-reusable-components
 * to the equivalent Tailwind utility classes.
 * Unknown tokens are passed through unchanged (e.g. custom CSS classes).
 */
const TOKEN_MAP: Record<string, string> = {
  // Colour variants
  inverted:
    "bg-white text-[#1B7FA7] border border-[#1B7FA7] " +
    "hover:bg-[#54514A] hover:text-white hover:border-[#54514A] focus:text-[#1B7FA7]",
  danger:
    "bg-[#D0343A] hover:bg-white hover:text-[#D0343A] hover:border hover:border-[#D0343A]",
  success:
    "bg-[#008918] hover:bg-white hover:text-[#008918] hover:border hover:border-[#008918]",
  transparent:
    "bg-transparent text-[#111] font-normal p-0 border-transparent " +
    "hover:bg-transparent hover:text-[#111] hover:border-transparent",
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
  centered: "mx-auto w-[25vw] text-[1.8vw] border border-[#1B7FA7]",
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
          // Base styles matching the original library
          "btn inline-flex items-center justify-center text-white bg-[#1B7FA7] m-2 rounded text-base px-3 py-1.5 font-bold min-h-6",
          "transition-colors duration-500",
          "hover:bg-[#54514A] hover:text-white hover:border-[#54514A]",
          "focus:text-white",
          "disabled:pointer-events-none",
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
