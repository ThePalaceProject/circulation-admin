import * as React from "react";
import { Panel, Button, Glyphicon } from "react-bootstrap";

export interface CollapsibleProps {
  title: string;
  body: string;
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
    return (
      <button bsStyle="default" onClick={this.toggle}>
        <span>{this.props.title}</span>
        <Glyphicon glyph={icon} />
      </button>
    );
  }

  render() {
    return (
      <Panel className="collapsible" collapsible={true} header={this.renderHeader()} expanded={this.state.open}>
        <section dangerouslySetInnerHTML={{__html: this.props.body}}></section>
      </Panel>
    );
  }
}
