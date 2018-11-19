import * as React from "react";
import { Panel, Button, Glyphicon } from "react-bootstrap";

export interface CollapsibleProps {
  title: string;
  text?: string;
  type?: string;
  body?: JSX.Element;
  openByDefault?: boolean;
  collapsible?: boolean;
}

export interface CollapsibleState {
  open: boolean;
}

export default class Collapsible extends React.Component<CollapsibleProps, CollapsibleState> {
  static defaultProps = {
    collapsible: true,
  };

  constructor(props) {
    super(props);
    this.state = { open: this.props.openByDefault || false };
    this.toggle = this.toggle.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderSection = this.renderSection.bind(this);
  }

  toggle(e) {
    e.preventDefault();
    this.setState({ open: !this.state.open });
  }

  renderHeader() {
    let icon = this.state.open ? "minus" : "plus";
    const { collapsible, title } = this.props;
    const content = (
      <div>
        <span>{title}</span>
        { collapsible ? <Glyphicon glyph={icon} /> : null}
      </div>
    );

    let [ element, type ] = collapsible ? ["button", "button"] : ["div", null];

    return React.createElement(element, {
      bsStyle: "default",
      onClick: this.toggle,
      type: type
    }, content );
  }

  renderSection() {
    const { body, text, type } = this.props;
    if (text && type === "instruction") {
      return <section dangerouslySetInnerHTML={{ __html: text }} />;
    } else if (body) {
      return <section>{body}</section>;
    }
    return null;
  }

  render() {
    const className = this.props.type === "instruction" ? "instruction" : "";
    const staticPanel = !this.props.collapsible ? "staticPanel" : "";
    return (
      <Panel
        className={`collapsible ${className} ${staticPanel}`}
        collapsible={this.props.collapsible}
        header={this.renderHeader()}
        expanded={this.state.open}
      >
        {this.renderSection()}
      </Panel>
    );
  }
}
