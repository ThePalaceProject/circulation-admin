import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Use this instead of plain string concatenation when composing Tailwind classes.
 *
 * @example
 * cn("px-4 py-2", condition && "bg-red-500", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
