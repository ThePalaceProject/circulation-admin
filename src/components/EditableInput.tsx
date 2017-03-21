import * as React from "react";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  elementType?: string;
  label?: string;
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
    let element = this.props.elementType;

    return (
      <div className="form-group">
        { this.props.label &&
          <label className="control-label">
            {this.props.label}
            { this.renderElement() }
          </label>
        }
        { !this.props.label &&
          this.renderElement()
        }
      </div>
    );
  }

  renderElement() {
    return React.createElement(this.props.elementType, {
      className: "form-control",
      type: this.props.type,
      disabled: this.props.disabled,
      readOnly: this.props.readOnly,
      name: this.props.name,
      ref: "element",
      value: this.state.value,
      onChange: this.handleChange,
      style: this.props.style,
      placeholder: this.props.placeholder,
    }, this.props.children);
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.props.value) {
      this.setState({
        value: props.value || ""
      });
    }
  }

  handleChange() {
    if (!this.props.readOnly && (!this.props.onChange || this.props.onChange() !== false)) {
      this.setState({
        value: this.getValue()
      });
    }
  }

  getValue() {
    return (this.refs as any).element.value;
  }

  clear() {
    this.setState({ value: "" });
  }
}