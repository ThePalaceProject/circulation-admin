import * as React from "react";

export interface EditableSelectProps extends React.HTMLProps<EditableSelect> {
  label?: string;
  value?: string;
  name: string;
  disabled: boolean;
  onChange?: () => any;
}

export default class EditableSelect extends React.Component<EditableSelectProps, any> {
  constructor(props) {
    super(props);
    this.state = { value: props.value || "" };
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    return (
      <div className="form-group">
        { this.props.label &&
          <label className="control-label">{this.props.label}</label>
        }
        <select
          className="form-control"
          disabled={this.props.disabled}
          name={this.props.name}
          ref="select"
          value={this.state.value}
          onChange={this.handleChange}
          style={this.props.style}
          placeholder={this.props.placeholder}>
          {this.props.children}
        </select>
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
    return (this.refs as any).select.value;
  }

  reset() {
    (this.refs as any).select.value = "";
  }
}