import * as React from "react";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  elementType?: string;
  label?: string;
  description?: string;
  onChange?: () => any;
}

export interface EditableInputState {
  value: string;
  checked: boolean;
}

export default class EditableInput extends React.Component<EditableInputProps, EditableInputState> {
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
      <div className="form-group">
        { this.props.label &&
          <label className="control-label">
            { this.props.type !== "checkbox" && this.props.label }
            { this.renderElement() }
            { this.props.type === "checkbox" && this.props.label }
          </label>
        }
        { !this.props.label &&
          this.renderElement()
        }
        { this.props.description &&
          <span className="description" dangerouslySetInnerHTML={{__html: this.props.description}} />
        }
      </div>
    );
  }

  renderElement() {
    return React.createElement(this.props.elementType || "input", {
      className: (this.props.type !== "checkbox" ? "form-control" : ""),
      type: this.props.type,
      disabled: this.props.disabled,
      readOnly: this.props.readOnly,
      name: this.props.name,
      ref: "element",
      value: this.state.value,
      checked: this.state.checked,
      onChange: this.handleChange,
      style: this.props.style,
      placeholder: this.props.placeholder,
      accept: this.props.accept
    }, this.props.children);
  }

  componentWillReceiveProps(props) {
    let value = this.state.value;
    let checked = this.state.checked;
    let changed = false;
    if (props.value !== this.props.value) {
      value = props.value || "";
      changed = true;
    }
    if (props.checked !== this.props.checked) {
      checked = props.checked || false;
      changed = true;
    }
    if (changed) {
      this.setState({ value, checked });
    }
  }

  handleChange() {
    if (!this.props.readOnly && (!this.props.onChange || this.props.onChange() !== false)) {
      let value = this.state.value;
      let checked = this.state.checked;
      if (this.props.type === "checkbox") {
        checked = !this.state.checked;
      } else {
        value = this.getValue();
      }
      this.setState({ value, checked });
    }
  }

  getValue() {
    return (this.refs as any).element.value;
  }

  clear() {
    this.setState({ value: "", checked: false });
  }
}