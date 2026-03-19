import * as React from "react";
import { Button } from "../ui";
import { PencilIcon } from "@nypl/dgx-svg-icons";

export interface WithEditButtonProps {
  disabled: boolean;
  onEdit: () => void;
}

/** When wrapped around an element, renders an edit button next to the element. */
export default class WithEditButton extends React.Component<
  WithEditButtonProps,
  Record<string, never>
> {
  render(): JSX.Element {
    const editContent = (
      <span>
        Edit <PencilIcon title="Edit library" />
      </span>
    );
    return (
      <div className="flex items-center gap-2">
        <span>{this.props.children}</span>
        <Button
          className="edit-btn inline-flex items-center px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
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
