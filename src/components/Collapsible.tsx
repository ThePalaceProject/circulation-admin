import * as React from "react";
import { Panel, Button, Glyphicon } from "react-bootstrap";

export interface CollapsibleProps {
  title: string;
  text?: string;
  elementType?: string;
  body?: JSX.Element;
  collapsible?: boolean;
}

export interface CollapsibleState {
  open: boolean;
}

export default class Collapsible extends React.Component<CollapsibleProps, CollapsibleState> {

  constructor(props) {
    super(props);
    this.state = { open: false };
    this.toggle = this.toggle.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  toggle(e) {
    e.preventDefault();
    this.setState({ open: !this.state.open });
  }

  renderHeader() {
    let icon = this.state.open ? "minus" : "plus";
    // return (
    //   <button bsStyle="default" onClick={this.toggle}>
    //     <span>{this.props.title}</span>
    //     <Glyphicon glyph={icon} />
    //   </button>
    // );
    const { elementType, text, body } = this.props;
    const shouldBeButton = elementType === "button";
    const content = (<span>
        <span>{this.props.title}</span>
        {this.props.collapsible ? <Glyphicon glyph={icon} /> : null}
      </span>);
    return React.createElement(elementType || "div", {
      className: shouldBeButton ? "collapsible" : "",
      bsStyle: "default",
      onClick: this.toggle,
    }, content );
  }

  render() {
    const { elementType, body, text } = this.props;
    let section;
    let className = "";
    if (elementType === "button") {
      className = "collapsible";
      section = <section dangerouslySetInnerHTML={{ __html: text }} />;
    } else if (body) {
      section = <section>{body}</section>;
    }

    return (
      <Panel
        className={className}
        collapsible={this.props.collapsible}
        header={this.renderHeader()}
        expanded={this.state.open}
      >
        {section}
      </Panel>
    );
  }
}
