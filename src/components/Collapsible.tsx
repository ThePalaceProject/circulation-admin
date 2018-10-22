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
  }

  toggle() {
    let icon = this.state.icon === "chevron-down" ? "chevron-up" : "chevron-down";
    this.setState({ open: !this.state.open, icon });
  }

  render() {
    return (
      <Panel className="collapsible" expanded={this.state.open}>
        <Panel.Heading>
          <Panel.Title componentClass="span">{this.props.title}</Panel.Title>
          <Button bsSize="xsmall" bsStyle="info" onClick={this.toggle}>
            <Glyphicon glyph={this.state.icon} />
          </Button>
        </Panel.Heading>
        <Panel.Body collapsible dangerouslySetInnerHTML={{__html: this.props.body}}></Panel.Body>
      </Panel>
    );
  }
}
