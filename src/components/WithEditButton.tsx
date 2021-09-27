import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { PencilIcon } from "@nypl/dgx-svg-icons";

export interface WithEditButtonProps {
  disabled: boolean;
  onEdit: () => void;
}

/** When wrapped around an element, renders an edit button next to the element. */
export default class WithEditButton extends React.Component<
  WithEditButtonProps,
  {}
> {
  render(): JSX.Element {
    const editContent = (
      <span>
        Edit <PencilIcon title="Edit library" />
      </span>
    );
    return (
      <div className="with-edit-button">
        <span>{this.props.children}</span>
        <Button
          className="edit-btn small"
          callback={this.onClick.bind(this)}
          content={editContent}
          type="button"
        />
      </div>
    );
  }

  onClick(e: Event) {
    e.preventDefault();
    !this.props.disabled && this.props.onEdit();
  }
}
