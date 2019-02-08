import * as React from "react";

export interface ToolTipState {
  show: boolean;
}

export interface ToolTipProps {
  trigger: JSX.Element;
  text: string;
}

export default class ToolTip extends React.Component <ToolTipProps, ToolTipState> {

  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.setState({ show: true });
  }

  hide() {
    this.setState({ show: false });
  }

  render(): JSX.Element {
    return(
      <section className="tool-tip-container" onMouseEnter={this.show} onMouseLeave={this.hide}>
        { this.props.trigger }
        <span className={`tool-tip ${this.state.show ? "" : "hide"}`}>{this.props.text}</span>
      </section>
    );
  }
}
