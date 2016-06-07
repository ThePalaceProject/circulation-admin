import * as React from "react";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  label?: string;
  value?: string;
  name: string;
  disabled: boolean;
  type: string;
  onChange?: () => any;
}

export default class EditableInput extends React.Component<EditableInputProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || ""
    };
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    return (
      <div className="form-group">
        { this.props.label &&
          <label className="control-label">{this.props.label}</label>
        }
        <input
          className="form-control"
          type={this.props.type}
          disabled={this.props.disabled}
          name={this.props.name}
          ref="input"
          value={this.state.value}
          onChange={this.handleChange}
          style={this.props.style}
          placeholder={this.props.placeholder}
          />
      </div>
    );
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.props.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleChange() {
    if (!this.props.onChange || this.props.onChange() !== false) {
      this.setState({
        value: this.getValue()
      });
    }
  }

  getValue() {
    return (this.refs as any).input.value;
  }

  reset() {
    (this.refs as any).input.value = "";
  }
}