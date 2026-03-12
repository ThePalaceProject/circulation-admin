/* eslint-disable */
/**
 * Panel component — drop-in replacement for library-simplified-reusable-components Panel.
 *
 * A collapsible section with a coloured header and optional content area.
 *
 * Props:
 *   id            — HTML id; used for aria-controls
 *   headerText    — heading string
 *   content       — panel body (ReactNode)
 *   style         — colour variant: "default"|"success"|"warning"|"danger"|"instruction"
 *   collapsible   — whether the panel can be toggled (default true)
 *   openByDefault — whether the panel starts open (default false)
 *   onEnter       — function to call on Enter key press in the header
 *                    (overrides the default toggle-on-enter behaviour; use when
 *                    the Panel is inside a form that should submit on Enter)
 */
import * as React from "react";
import { cn } from "../../lib/utils";

type PanelStyle = "default" | "success" | "warning" | "danger" | "instruction";

const HEADER_STYLES: Record<PanelStyle, string> = {
  default: "bg-gray-200 hover:bg-[#91887d] hover:text-white",
  success: "bg-[#809f69] hover:bg-[#497629] text-white hover:text-white",
  warning: "bg-[#ffcd61] hover:bg-[#9d6b00] hover:text-white",
  danger: "bg-[#da5d62] hover:bg-[#aa272c] text-white hover:text-white",
  instruction: "bg-[#acd0df] hover:bg-[#1B7FA7] hover:text-white",
};

export interface PanelProps {
  id?: string;
  headerText?: string;
  content?: React.ReactNode;
  style?: PanelStyle | string;
  collapsible?: boolean;
  openByDefault?: boolean;
  onEnter?: (e?: any) => void;
  className?: string;
}

const Panel: React.FC<PanelProps> = ({
  id,
  headerText,
  content,
  style = "default" as PanelStyle | string,
  collapsible = true,
  openByDefault = false,
  onEnter,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(
    !collapsible ? true : openByDefault
  );

  // Non-collapsible panels are always open; ignore state toggle
  const open = !collapsible ? true : isOpen;

  const toggle = () => {
    if (collapsible) setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (onEnter) {
        onEnter(e);
      } else {
        toggle();
      }
    }
  };

  const bodyId = id ? `${id}-body` : undefined;
  const headerStyles =
    HEADER_STYLES[style as PanelStyle] ?? HEADER_STYLES.default;
  // Map style → Bootstrap-compatible panel-* class so enzyme .hasClass("panel-success") etc. still work
  const panelStyleClass = style ? `panel-${style}` : "panel-default";

  return (
    <div
      className={cn(
        "panel block w-full mb-2 border border-gray-200 rounded",
        panelStyleClass,
        className
      )}
    >
      {/* Header — rendered as a button when collapsible, div otherwise */}
      {collapsible ? (
        <button
          type="button"
          className={cn(
            "panel-heading flex w-full h-full px-6 py-4 border-0 justify-between items-center",
            "transition-colors duration-500 text-left font-bold",
            headerStyles
          )}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={toggle}
          onKeyDown={handleKeyDown}
        >
          <span className="panel-title">{headerText}</span>
          <i aria-hidden="true">{open ? "▲" : "▼"}</i>
        </button>
      ) : (
        <div
          className={cn(
            "panel-heading flex w-full h-full px-6 py-4 border-0 justify-between items-center font-bold",
            headerStyles
          )}
        >
          <span className="panel-title">{headerText}</span>
        </div>
      )}

      {/* Body — always in the DOM so nested components are findable by tests.
           Hidden via display:none when closed (mirrors the original library behaviour). */}
      <div
        id={bodyId}
        className="panel-body p-6"
        style={open ? undefined : { display: "none" }}
        aria-hidden={open ? undefined : true}
      >
        {content}
      </div>
    </div>
  );
};

Panel.displayName = "Panel";

export { Panel };
export default Panel;
