import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import TrashIcon from "./icons/TrashIcon";

export interface WithRemoveButtonProps {
  disabled: boolean;
  onRemove: () => void;
  confirmRemoval?: () => boolean;
}

/** When wrapped around an element, renders a remove button next to the element. */
export default class WithRemoveButton extends React.Component<
  WithRemoveButtonProps,
  {}
> {
  static defaultProps = {
    disabled: false,
  };
  render(): JSX.Element {
    const removeContent = (
      <span>
        Delete <TrashIcon />
      </span>
    );
    return (
      <div className="with-remove-button">
        <span>{this.props.children}</span>
        <Button
          className="remove-btn danger small"
          callback={this.onClick.bind(this)}
          content={removeContent}
          type="button"
          disabled={this.props.disabled}
        />
      </div>
    );
  }

  onClick(e: Event) {
    e.preventDefault();

    // Don't remove if confirmation function is present and returns false.
    if (this.props.confirmRemoval && !this.props.confirmRemoval()) {
      return;
    }
    // Otherwise, we can proceed with removal.
    !this.props.disabled && this.props.onRemove();
  }
}
