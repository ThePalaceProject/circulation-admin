import * as React from "react";
import { Panel, Button, Glyphicon } from "react-bootstrap";

export interface CollapsibleProps {
  title: string;
  body: string;
}

export interface CollapsibleState {
  open: boolean;
  icon: string;
}

export default class Collapsible extends React.Component<CollapsibleProps, CollapsibleState> {

  constructor(props) {
    super(props);
    this.state = { open: false, icon: "chevron-down" };
    this.toggle = this.toggle.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  toggle() {
    let icon = this.state.icon === "chevron-down" ? "chevron-up" : "chevron-down";
    this.setState({ open: !this.state.open, icon });
  }

  renderHeader() {
    return (
      <div onClick={this.toggle}>
        <span>{this.props.title}</span>
        <Button bsSize="xsmall" bsStyle="primary">
          <Glyphicon glyph={this.state.icon} />
        </Button>
      </div>
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
