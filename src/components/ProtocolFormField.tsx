import * as React from "react";
import EditableInput from "./EditableInput";
import { ProtocolField } from "../interfaces";

export interface ProtocolFormFieldProps {
  field: ProtocolField;
  disabled: boolean;
  value?: string;
}

export default class ProtocolFormField extends React.Component<ProtocolFormFieldProps, void> {
  render(): JSX.Element {
    const field = this.props.field;
    if (field.type === "text" || field.type === undefined) {
      return (
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name={field.key}
          label={field.label + (field.optional ? " (optional)" : "")}
          value={this.props.value}
          ref="element"
          />
      );
    } else if (field.type === "select") {
      return (
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          name={field.key}
          label={field.label + (field.optional ? " (optional)" : "")}
          value={this.props.value}
          ref="element"
          >
          { field.options && field.options.map(option =>
              <option key={option.key} value={option.key}>{option.label}</option>
            )
          }
        </EditableInput>
      );
    }
  }

  getValue() {
    return (this.refs["element"] as any).getValue();
  }
}