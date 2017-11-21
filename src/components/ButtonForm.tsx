import * as React from "react";

export interface ButtonFormProps extends React.HTMLProps<ButtonForm> {
  label: string;
  disabled?: boolean;
}

/** Submit button. */
export default class ButtonForm extends React.Component<ButtonFormProps, any> {
  render(): JSX.Element {
    let disabledProps = this.props.disabled ? { disabled: true } : {};

    return (
      <input
        className={"btn btn-default button-form " + this.props.className}
        type="submit"
        value={this.props.label}
        onClick={this.props.onClick}
        {...disabledProps}
        />
    );
  }
}