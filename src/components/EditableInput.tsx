import * as React from "react";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  elementType?: string;
  label?: string;
  description?: string;
  onChange?: (e: any) => any;
  required?: boolean;
  error?: FetchErrorData;
  optionalText?: boolean;
  validation?: string;
  clientError?: boolean;
}

export interface EditableInputState {
  value: string;
  checked: boolean;
}

/** Renders an input element with a value that can be changed. It's necessary to have this
    because if the element gets its value from a prop, the user won't be able to make any changes.
    This component keeps an updated value in its state. This also handles rendering an optional
    label and description for the input. */
export default class EditableInput extends React.Component<EditableInputProps, EditableInputState> {
  static defaultProps = {
    optionalText: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || "",
      checked: props.checked || false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    const checkboxOrRadioOrSelect = !!(
      this.props.type === "checkbox" ||
      this.props.type === "radio" ||
      this.props.elementType === "select");
    const optionalText = (this.props.optionalText && !this.props.required && !checkboxOrRadioOrSelect)
      ? "(Optional) " : "";
    const descriptionText = this.props.description ? this.props.description : "";
    const description = `${optionalText}${descriptionText}`;
    const errorClass = this.props.clientError ||
      (this.props.error && this.props.error.status >= 400 &&
      !this.state.value && this.props.required) ?
      "field-error" : "";
    return (
      <div className={`form-group ${errorClass}`}>
        { this.props.label &&
          <label className="control-label">
            { this.props.type !== "checkbox" && this.props.type !== "radio" && this.props.label }
            { this.props.required && <span className="required-field">Required</span>}
            { this.renderElement() }
            { this.props.type === "checkbox" && this.props.label }
            { this.props.type === "radio" && <span>{this.props.label}</span> }
          </label>
        }
        {!this.props.label && this.renderElement()}
        {description.trim() && this.renderDescription(description)}
      </div>
    );
  }

  renderElement() {
    return React.createElement(this.props.elementType || "input", {
      className: ((this.props.type !== "checkbox" && this.props.type !== "radio") ? "form-control" : ""),
      type: this.props.type,
      disabled: this.props.disabled,
      readOnly: this.props.readOnly,
      name: this.props.name,
      ref: "element",
      value: this.state.value,
      checked: this.state.checked,
      onKeyPress: this.props.validation && this.props.validation === "number" && this.validateNumber,
      onChange: this.handleChange,
      style: this.props.style,
      placeholder: this.props.placeholder,
      accept: this.props.accept,
      list: this.props.list,
      min: this.props.min,
      max: this.props.max,
    }, this.props.children);
  }

  renderDescription(description: string) {
    return <p className="description" dangerouslySetInnerHTML={{__html: description}} />;
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
    if (!this.props.readOnly && (!this.props.onChange || this.props.onChange(this.getValue()) !== false)) {
      let value = this.state.value;
      let checked = this.state.checked;
      if (this.props.type === "checkbox" || this.props.type === "radio") {
        checked = !this.state.checked;
      } else {
        value = this.getValue();
      }
      this.setState({ value, checked });
    }
  }

  validateNumber(e) {
    const validChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "Enter"];
    if (validChars.indexOf(e.key) < 0) {
      e.preventDefault();
    }
  }

  getValue() {
    return (this.refs as any).element.value;
  }

  getChecked() {
    return (this.refs as any).element.checked;
  }

  clear() {
    this.setState({ value: "", checked: false });
  }
}
