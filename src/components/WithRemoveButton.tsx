import * as React from "react";
import * as ReactDOM from "react-dom";

export interface WithRemoveButtonProps {
  disabled: boolean;
  onRemove: () => void;
}

/** When wrapped around an element, renders a remove button next to the element. */
export default class WithRemoveButton extends React.Component<WithRemoveButtonProps, void> {
  render(): JSX.Element {
    return (
      <div className="with-remove-button">
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
