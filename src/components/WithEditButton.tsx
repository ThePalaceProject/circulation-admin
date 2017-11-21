import * as React from "react";
import * as ReactDOM from "react-dom";

export interface WithEditButtonProps {
  disabled: boolean;
  onEdit: () => void;
}

/** When wrapped around an element, renders an edit button next to the element. */
export default class WithEditButton extends React.Component<WithEditButtonProps, void> {
  render(): JSX.Element {
    return (
      <div className="with-edit-button">
        <span>
          { this.props.children }
        </span>
        <i
          className="fa fa-pencil-square-o edit"
          aria-hidden="true"
          onClick={() => !this.props.disabled && this.props.onEdit()}
          ></i>
        <a
          className="sr-only"
          onClick={() => !this.props.disabled && this.props.onEdit()}
          >edit</a>
      </div>
    );
  }
}