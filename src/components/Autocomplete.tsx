import * as React from "react";
import EditableInput from "./EditableInput";

export interface AutocompleteProps {
  autocompleteValues: string[];
  disabled: boolean;
  name: string;
  label: string;
  value?: string;
  onChange?: () => void;
}

export default class Autocomplete extends React.Component<AutocompleteProps, {}> {
  private inputRef = React.createRef<EditableInput>();
  render(): JSX.Element {
    return (
      <div>
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name={this.props.name}
          list={this.props.name + "-autocomplete-list"}
          label={this.props.label}
          value={this.props.value}
          ref={this.inputRef}
          optionalText={false}
          onChange={this.props.onChange}
        />
        <datalist
          id={this.props.name + "-autocomplete-list"}
          >
          { this.props.autocompleteValues.map(value =>
              <option value={value} key={value} aria-selected={this.props.value === value}></option>
            )
          }
        </datalist>
      </div>
    );
  }

  getValue() {
    return this.inputRef.current.getValue();
  }

  clear() {
    this.inputRef.current.setState({ value: "" });
  }
}
