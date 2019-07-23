import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { XIcon } from "@nypl/dgx-svg-icons";

export interface WithRemoveButtonProps {
  disabled: boolean;
  onRemove: () => void;
}

/** When wrapped around an element, renders a remove button next to the element. */
export default class WithRemoveButton extends React.Component<WithRemoveButtonProps, {}> {
  render(): JSX.Element {
    const removeContent = <span>Remove <XIcon title="Remove library" /></span>;
    return (
      <div className="with-remove-button">
        <span>
          { this.props.children }
        </span>
        <Button
          className="remove-btn danger"
          callback={this.onClick.bind(this)}
          content={removeContent}
        />
      </div>
    );
  }

  onClick(e: Event) {
    e.preventDefault();
    !this.props.disabled && this.props.onRemove();
  }
}
