import * as React from "react";
import EditableInput from "./EditableInput";
import { ProtocolField } from "../interfaces";

export interface ProtocolFormFieldProps {
  field: ProtocolField;
  disabled: boolean;
  value?: string | string[];
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
          value={this.props.value || field.default}
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
          value={this.props.value || field.default}
          ref="element"
          >
          { field.options && field.options.map(option =>
              <option key={option.key} value={option.key}>{option.label}</option>
            )
          }
        </EditableInput>
      );
    } else if (field.type === "list") {
      return (
        <div>
          <h3>{field.label}</h3>
          { field.options && field.options.map(option =>
              <EditableInput
                elementType="input"
                type="checkbox"
                disabled={this.props.disabled}
                name={`${field.key}_${option.key}`}
                label={option.label}
                checked={this.props.value && (this.props.value.indexOf(option.key) !== -1)}
                />
            )
          }
        </div>
      );
    }
  }

  getValue() {
    return (this.refs["element"] as any).getValue();
  }
}