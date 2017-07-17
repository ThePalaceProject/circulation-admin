import * as React from "react";
import * as ReactDOM from "react-dom";

export interface EditableProps {
  disabled: boolean;
  onEdit: () => void;
}

export default class Editable extends React.Component<EditableProps, void> {
  render(): JSX.Element {
    return (
      <div className="editable">
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