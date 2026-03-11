import * as React from "react";

export interface SaveButtonProps {
  disabled: boolean;
  submit?: any;
  text?: string;
  type?: "submit" | "reset" | "button";
}

export default class SaveButton extends React.Component<SaveButtonProps, {}> {
  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    const text = this.props.text || "Save";
    const type = this.props.type || "submit";
    return (
      <button
        type={type}
        className="btn btn-default"
        disabled={this.props.disabled}
        onClick={this.props.submit}
      >
        {text}
      </button>
    );
  }
}
