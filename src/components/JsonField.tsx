import * as React from "react";
import { SettingData } from "../interfaces";

export interface JsonFieldProps {
  setting: SettingData;
  value?: any;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: any) => void;
}

export interface JsonFieldState {
  text: string;
  jsonError: string | null;
}

function valueToText(value: any): string {
  if (value === null || value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

export default class JsonField extends React.Component<
  JsonFieldProps,
  JsonFieldState
> {
  static displayName = "JsonField";

  constructor(props: JsonFieldProps) {
    super(props);
    this.state = {
      text: valueToText(props.value),
      jsonError: null,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps: JsonFieldProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ text: valueToText(nextProps.value), jsonError: null });
    }
  }

  handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    let jsonError: string | null = null;
    let parsed: any = null;
    if (text.trim()) {
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        jsonError = err.message;
      }
    }
    this.setState({ text, jsonError });
    if (!jsonError && this.props.onChange) {
      this.props.onChange(text.trim() ? parsed : null);
    }
  }

  getValue(): any {
    const { text } = this.state;
    if (!text.trim()) return null;
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }

  clear() {
    this.setState({ text: "", jsonError: null });
  }

  render(): JSX.Element {
    const { setting, disabled, readOnly } = this.props;
    const { text, jsonError } = this.state;
    const descId = setting.description ? `json-desc-${setting.key}` : undefined;

    return (
      <div className={`form-group${jsonError ? " field-error" : ""}`}>
        <label className="control-label">
          {setting.label}
          {setting.required && <span className="required-field">Required</span>}
          <textarea
            className="form-control"
            name={setting.key}
            value={text}
            onChange={this.handleChange}
            disabled={disabled}
            readOnly={readOnly}
            aria-describedby={descId}
          />
        </label>
        {setting.description && (
          <p
            id={descId}
            className="description"
            dangerouslySetInnerHTML={{ __html: setting.description }}
          />
        )}
        {jsonError && <p className="description">{jsonError}</p>}
      </div>
    );
  }
}
