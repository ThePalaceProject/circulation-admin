import * as React from "react";
import * as ReactDOM from "react-dom";

export interface RemovableProps {
  disabled: boolean;
  onRemove: () => void;
}

export default class Removable extends React.Component<RemovableProps, void> {
  render(): JSX.Element {
    return (
      <div className="removable">
        <span>
          { this.props.children }
        </span>
        <i
          className="fa fa-times remove"
          aria-hidden="true"
          onClick={() => !this.props.disabled && this.props.onRemove()}
          ></i>
        <a
          className="sr-only"
          onClick={() => !this.props.disabled && this.props.onRemove()}
          >remove</a>
      </div>
    );
  }
}