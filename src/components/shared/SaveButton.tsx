import * as React from "react";
import { Button } from "../ui/button";

export interface SaveButtonProps {
  disabled: boolean;
  submit?: any;
  text?: string;
  type?: "submit" | "reset" | "button";
}

export default class SaveButton extends React.Component<
  SaveButtonProps,
  Record<string, never>
> {
  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    const text = this.props.text || "Save";
    const type = this.props.type || "submit";
    return (
      <Button
        type={type}
        content={text}
        disabled={this.props.disabled}
        onClick={this.props.submit}
      />
    );
  }
}
