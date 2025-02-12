import * as React from "react";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { defaultValueIfMissing } from "./ProtocolFormField";

const DEFAULT_VALUE = "";

let descriptonIdCounter = 0;

function generateDescriptionId(): string {
  return `editableInputDescription-${descriptonIdCounter++}`;
}

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
  extraContent?: string | JSX.Element;
  className?: string;
  minLength?: number;
  maxLength?: number;
}

export interface EditableInputState {
  value: string;
  checked: boolean;
}

/** Renders an input element with a value that can be changed. It's necessary to have this
    because if the element gets its value from a prop, the user won't be able to make any changes.
    This component keeps an updated value in its state. This also handles rendering an optional
    label and description for the input. */
export default class EditableInput extends React.Component<
  EditableInputProps,
  EditableInputState
> {
  private elementRef = React.createRef<HTMLInputElement>();
  static displayName = "EditableInput";
  static defaultProps = {
    optionalText: true,
    readOnly: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: defaultValueIfMissing(props?.value, DEFAULT_VALUE),
      checked: props.checked || false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    const {
      type,
      elementType,
      optionalText,
      required,
      description,
      clientError,
      error,
      label,
      extraContent,
    } = this.props;
    const checkboxOrRadioOrSelect = !!(
      type === "checkbox" ||
      type === "radio" ||
      elementType === "select"
    );
    const optionalTextStr =
      optionalText && !required && !checkboxOrRadioOrSelect
        ? "(Optional) "
        : "";
    const descriptionText = description ? description : "";
    const descriptionStr = `${optionalTextStr}${descriptionText}`.trim();
    const descriptionId = descriptionStr && generateDescriptionId();

    const errorClass =
      clientError ||
      (error && error.status >= 400 && !this.state.value && required)
        ? "field-error"
        : "";
    return (
      <div className={`form-group ${errorClass} ${this.props.className}`}>
        {label && (
          <label className="control-label">
            {type !== "checkbox" && type !== "radio" && label}
            {required && <span className="required-field">Required</span>}
            {this.renderElement(this.props, descriptionId)}
            {type === "checkbox" && label}
            {type === "radio" && <span>{label}</span>}
          </label>
        )}
        {(extraContent || !label) && (
          <div className={extraContent ? "with-add-on" : ""}>
            {extraContent}
            {!label && this.renderElement(this.props, descriptionId)}
          </div>
        )}
        {descriptionStr &&
          this.renderDescription(descriptionId, descriptionStr)}
      </div>
    );
  }

  renderElement(props, descriptionId?: string) {
    const {
      type,
      elementType,
      placeholder,
      accept,
      list,
      min,
      max,
      children,
      disabled,
      readOnly,
      name,
      validation,
      style,
      minLength,
      maxLength,
    } = props;

    return React.createElement(
      elementType || "input",
      {
        className:
          type !== "checkbox" && type !== "radio" ? "form-control" : "",
        ref: this.elementRef,
        value: this.state.value,
        checked: this.state.checked,
        onKeyPress:
          validation && validation === "number" && this.validateNumber,
        onChange: this.handleChange,
        type,
        disabled,
        readOnly,
        name,
        style,
        placeholder,
        accept,
        list,
        min,
        max,
        minLength,
        maxLength,
        ["aria-label"]: this.props["aria-label"],
        ["aria-describedby"]: descriptionId,
      },
      children
    );
  }

  renderDescription(id: string, description: string) {
    return (
      <p
        id={id}
        className="description"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let value = this.state.value;
    let checked = this.state.checked;
    let changed = false;
    if (nextProps.value !== this.props.value) {
      value = defaultValueIfMissing(nextProps.value, DEFAULT_VALUE);
      changed = true;
    }
    if (nextProps.checked !== this.props.checked) {
      checked = nextProps.checked || false;
      changed = true;
    }
    if (changed) {
      this.setState({ value, checked });
    }
  }

  handleChange() {
    if (
      !this.props.readOnly &&
      (!this.props.onChange || this.props.onChange(this.getValue()) !== false)
    ) {
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
    const validChars = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ".",
      "Enter",
    ];
    if (validChars.indexOf(e.key) < 0) {
      e.preventDefault();
    }
  }

  getValue() {
    return this.elementRef.current?.value;
  }

  getChecked() {
    return this.elementRef.current?.checked;
  }

  setValue(value) {
    this.setState({ value });
  }

  clear() {
    this.setState({ value: "", checked: false });
  }
}
