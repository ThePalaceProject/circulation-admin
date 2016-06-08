import * as React from "react";

export interface EditableRadioProps extends React.HTMLProps<EditableRadio> {
  label?: string;
  name: string;
  disabled: boolean;
  onChange?: () => any;
  checked: boolean;
}

export default class EditableRadio extends React.Component<EditableRadioProps, any> {
  constructor(props) {
    super(props);
    this.state = {
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
          value={this.props.value}
          ref="element"
          onChange={this.handleChange}
          style={this.props.style}
          placeholder={this.props.placeholder}
          checked={this.props.checked}
          />
        {" " + this.props.label}
      </div>
    );
  }

  componentWillReceiveProps(props) {
    if (props.checked !== this.props.checked) {
      this.setState({
        checked: props.checked
      });
    }
  }

  handleChange() {
    if (!this.props.onChange || this.props.onChange() !== false) {
      this.setState({
        checked: this.getChecked()
      });
    }
  }

  getChecked() {
    return (this.refs as any).element.checked;
  }

  reset() {
    (this.refs as any).element.checked = false;
  }
}