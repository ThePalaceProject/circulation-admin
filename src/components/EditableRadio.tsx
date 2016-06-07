import * as React from "react";

export interface EditableCheckboxProps extends React.HTMLProps<EditableCheckbox> {
  label?: string;
  value?: string;
  name: string;
  disabled: boolean;
  onChange?: () => any;
}

export default class EditableCheckbox extends React.Component<EditableCheckboxProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || "",
      checked: props.checked || false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    return (
      <div className="radio">
        <input
          type="radio"
          disabled={this.props.disabled}
          name={this.props.name}
          ref="radio"
          value={this.state.value}
          onChange={this.handleChange}
          style={this.props.style}
          placeholder={this.props.placeholder}
          checked={this.props.checked}
          />
        {this.props.label}
      </div>
    );
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.props.value) {
      this.setState({
        value: props.value
      });
    }
    if (props.checked !== this.props.checked) {
      this.setState({
        checked: props.checked
      });
    }
  }

  handleChange() {
    if (!this.props.onChange || this.props.onChange() !== false) {
      this.setState({
        value: this.getValue(),
        checked: this.getChecked()
      });
    }
  }

  getValue() {
    return this.getChecked() ? (this.refs as any).radio.value : null;
  }

  getChecked() {
    return (this.refs as any).radio.checked;
  }

  reset() {
    (this.refs as any).radio.value = "";
    (this.refs as any).radio.checked = false;
  }
}