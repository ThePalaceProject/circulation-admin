import * as React from "react";
import GenericWedgeIcon from "../icons/GenericWedgeIcon";

export interface PanelProps {
  id: string;
  headerText: React.ReactNode;
  /** A React node, or a string of HTML. Give a string only from a trusted
   *  source, because it is rendered as HTML. */
  content: React.ReactNode;
  /** "default" (the default), "success", "warning", "danger",
   *  "instruction", or a custom style. It becomes the class `panel-<style>`. */
  style?: string;
  openByDefault?: boolean;
  /** When false, the panel is always open, and its header is a `<div>`
   *  with no toggle icon. The default is true. */
  collapsible?: boolean;
  /** Runs when a form inside the panel body sends a submit event. A `Form`
   *  with a submit button never sends one, because the button's click handler
   *  stops it. So this does not run for that `Form`. */
  onEnter?: () => void;
}

export interface PanelState {
  display: string;
}

/**
 * A panel with a header and a body, which can open and close. Copied from
 * library-simplified-reusable-components 1.3.18, with the same DOM, class
 * names, and props. That package bundles its own copy of React 16, which
 * React 19 cannot render.
 */
export default class Panel extends React.Component<PanelProps, PanelState> {
  static defaultProps = {
    style: "default",
    collapsible: true,
    openByDefault: false,
  };

  constructor(props: PanelProps) {
    super(props);
    this.renderHeader = this.renderHeader.bind(this);
    this.toggle = this.toggle.bind(this);
    this.overrideEnter = this.overrideEnter.bind(this);
    const display =
      this.props.openByDefault || !this.props.collapsible ? "" : "collapse";
    this.state = { display };
  }

  toggle(event: React.MouseEvent) {
    event.preventDefault();
    const display = this.state.display === "collapse" ? "" : "collapse";
    this.setState({ display });
  }

  overrideEnter() {
    if (this.props.onEnter) {
      this.props.onEnter();
    }
  }

  renderHeader(): React.JSX.Element {
    const title = (
      <span key="title" className="panel-title">
        {this.props.headerText}
      </span>
    );
    if (!this.props.collapsible) {
      return <div className="panel-heading">{title}</div>;
    }
    const isOpen = this.state.display === "";
    return (
      <button
        className="panel-heading"
        onClick={this.toggle}
        type="button"
        aria-expanded={isOpen}
        aria-controls={`${this.props.id}-panel`}
      >
        {title}
        <GenericWedgeIcon
          key="icon"
          className={`${isOpen ? "up-icon" : "down-icon"} icon`}
        />
      </button>
    );
  }

  render(): React.JSX.Element {
    const { style, content, collapsible, id } = this.props;
    const staticPanel = !collapsible ? "static-panel" : "";
    const bodyProps = {
      id: `${id}-panel`,
      onSubmit: this.overrideEnter,
      className: `panel-body ${this.state.display}`,
      // Only a collapsible panel hides its body.
      "aria-hidden": collapsible ? this.state.display !== "" : null,
    };
    return (
      <div className={`panel panel-${style} ${staticPanel}`}>
        {this.renderHeader()}
        {typeof content === "string" ? (
          <section
            {...bodyProps}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <section {...bodyProps}>{content}</section>
        )}
      </div>
    );
  }
}
