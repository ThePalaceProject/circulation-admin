import * as React from "react";
import { Panel, Button, Glyphicon } from "react-bootstrap";

export interface CollapsibleProps {
  title: string;
  text?: string;
  type?: string;
  body?: JSX.Element;
  openByDefault?: boolean;
}

export interface CollapsibleState {
  open: boolean;
}

export default class Collapsible extends React.Component<CollapsibleProps, CollapsibleState> {
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
    const { type, title } = this.props;
    let element = "div";
    if (type === "instruction") {
      element = "button";
    }
    const content = (<div>
        <span>{title}</span>
        <Glyphicon glyph={icon} />
      </div>);
    return React.createElement(element, {
      bsStyle: "default",
      onClick: this.toggle,
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
    return (
      <Panel
        className={`collapsible ${className}`}
        collapsible={true}
        header={this.renderHeader()}
        expanded={this.state.open}
      >
        {this.renderSection()}
      </Panel>
    );
  }
}
