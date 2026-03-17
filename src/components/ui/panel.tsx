/* eslint-disable */
/**
 * Panel component.
 *
 * A collapsible section with a coloured header.
 * Header colours use Tailwind utility classes; no legacy library-simplified styles.
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
  default: "", // themed via inline style — see headerStyleVars below
  success: "bg-[#809f69] hover:bg-[#497629] text-white hover:text-white",
  warning: "bg-[#ffcd61] hover:bg-[#9d6b00] hover:text-white",
  danger: "bg-[#da5d62] hover:bg-[#aa272c] text-white hover:text-white",
  instruction: "bg-sky-100 hover:bg-sky-600 hover:text-white",
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
  const isDefault =
    (style as PanelStyle) === "default" || !HEADER_STYLES[style as PanelStyle];
  const headerStyles = isDefault
    ? ""
    : HEADER_STYLES[style as PanelStyle] ?? "";
  // Map style → Bootstrap-compatible panel-* class so enzyme .hasClass("panel-success") etc. still work
  const panelStyleClass = style ? `panel-${style}` : "panel-default";

  // For the default style, use inline CSS vars so they beat every layer including @layer properties.
  const defaultHeaderStyle: React.CSSProperties | undefined = isDefault
    ? {
        backgroundColor: "var(--surface-muted-bg)",
        color: "var(--text-primary)",
        fontSize: "0.8125rem",
        fontWeight: 600,
      }
    : undefined;
  const defaultPanelStyle: React.CSSProperties | undefined = isDefault
    ? {
        borderColor: "var(--border-soft-color)",
        borderRadius: "6px",
        marginBottom: "12px",
      }
    : undefined;

  return (
    <div
      className={cn(
        "panel block w-full mb-2 border rounded",
        panelStyleClass,
        className
      )}
      style={defaultPanelStyle}
    >
      {/* Header — rendered as a button when collapsible, div otherwise */}
      {collapsible ? (
        <button
          type="button"
          className={cn(
            "panel-heading flex w-full h-full px-4 py-2.5 border-0 justify-between items-center",
            "transition-colors duration-150 text-left",
            headerStyles
          )}
          style={defaultHeaderStyle}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={toggle}
          onKeyDown={handleKeyDown}
        >
          <span className="panel-title">{headerText}</span>
          <i aria-hidden="true" style={{ fontSize: "0.625rem", opacity: 0.6 }}>
            {open ? "▲" : "▼"}
          </i>
        </button>
      ) : (
        <div
          className={cn(
            "panel-heading flex w-full h-full px-4 py-2.5 border-0 justify-between items-center",
            headerStyles
          )}
          style={defaultHeaderStyle}
        >
          <span className="panel-title">{headerText}</span>
        </div>
      )}

      {/* Body — always in the DOM so nested components are findable by tests.
           Hidden via display:none when closed (mirrors the original library behaviour). */}
      <div
        id={bodyId}
        className="panel-body p-5"
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
