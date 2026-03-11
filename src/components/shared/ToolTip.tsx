import * as React from "react";

export interface ToolTipState {
  show: boolean;
}

export interface ToolTipProps {
  trigger: JSX.Element;
  text: string;
  direction?: string;
}

/**
 * Displays a tooltip helper displaying additional information.
 */
export default class ToolTip extends React.Component<
  ToolTipProps,
  ToolTipState
> {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    this.showToolTip = this.showToolTip.bind(this);
    this.hideToolTip = this.hideToolTip.bind(this);
  }

  render(): JSX.Element {
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        className="tool-tip-container"
        onMouseEnter={this.showToolTip}
        onMouseLeave={this.hideToolTip}
        role="tooltip"
      >
        {this.props.trigger}
        <span
          className={`tool-tip ${this.state.show ? "" : "hide"} ${
            this.props.direction ? this.props.direction : ""
          }`}
          dangerouslySetInnerHTML={{ __html: this.props.text }}
        ></span>
      </div>
    );
  }

  showToolTip() {
    this.setState({ show: true });
  }

  hideToolTip() {
    this.setState({ show: false });
  }
}
