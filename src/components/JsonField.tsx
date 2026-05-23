import * as React from "react";
import CopyIcon from "./icons/CopyIcon";
import XCloseIcon from "./icons/XCloseIcon";
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
  copied: boolean;
  previousText: string | null;
  clearFeedback: boolean;
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
  private copyTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private clearFeedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: JsonFieldProps) {
    super(props);
    this.state = {
      text: valueToText(props.value),
      jsonError: null,
      copied: false,
      previousText: null,
      clearFeedback: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleClearClick = this.handleClearClick.bind(this);
    this.preventButtonBlur = this.preventButtonBlur.bind(this);
  }

  componentWillUnmount() {
    if (this.copyTimeoutId) clearTimeout(this.copyTimeoutId);
    if (this.clearFeedbackTimeoutId) clearTimeout(this.clearFeedbackTimeoutId);
  }

  UNSAFE_componentWillReceiveProps(nextProps: JsonFieldProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({
        text: valueToText(nextProps.value),
        jsonError: null,
        previousText: null,
        clearFeedback: false,
      });
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
    // Typing discards undo state and dismisses the cleared message.
    this.setState({
      text,
      jsonError,
      previousText: null,
      clearFeedback: false,
    });
    if (!jsonError && this.props.onChange) {
      this.props.onChange(text.trim() ? parsed : null);
    }
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      const { previousText } = this.state;
      if (previousText !== null) {
        e.preventDefault();
        if (this.clearFeedbackTimeoutId)
          clearTimeout(this.clearFeedbackTimeoutId);
        let jsonError: string | null = null;
        let parsed: any = null;
        if (previousText.trim()) {
          try {
            parsed = JSON.parse(previousText);
          } catch (err) {
            jsonError = err.message;
          }
        }
        this.setState({
          text: previousText,
          jsonError,
          previousText: null,
          clearFeedback: false,
        });
        if (!jsonError && this.props.onChange) {
          this.props.onChange(previousText.trim() ? parsed : null);
        }
      }
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

  handleCopy() {
    if (this.copyTimeoutId) clearTimeout(this.copyTimeoutId);
    this.setState({ copied: true });
    this.copyTimeoutId = setTimeout(() => {
      this.setState({ copied: false });
      this.copyTimeoutId = null;
    }, 2000);
    navigator.clipboard.writeText(this.state.text).catch(() => {
      if (this.copyTimeoutId) {
        clearTimeout(this.copyTimeoutId);
        this.copyTimeoutId = null;
      }
      this.setState({ copied: false });
    });
  }

  handleClearClick() {
    const previousText = this.state.text;
    if (this.clearFeedbackTimeoutId) clearTimeout(this.clearFeedbackTimeoutId);
    this.setState({
      text: "",
      jsonError: null,
      copied: false,
      previousText,
      clearFeedback: true,
    });
    this.clearFeedbackTimeoutId = setTimeout(() => {
      this.setState({ clearFeedback: false });
      this.clearFeedbackTimeoutId = null;
    }, 5000);
    if (this.props.onChange) {
      this.props.onChange(null);
    }
  }

  // Prevents buttons from stealing focus from the textarea.
  preventButtonBlur(e: React.MouseEvent) {
    e.preventDefault();
  }

  clear() {
    if (this.clearFeedbackTimeoutId) clearTimeout(this.clearFeedbackTimeoutId);
    this.setState({
      text: "",
      jsonError: null,
      copied: false,
      previousText: null,
      clearFeedback: false,
    });
    if (this.props.onChange) {
      this.props.onChange(null);
    }
  }

  render(): JSX.Element {
    const { setting, disabled, readOnly } = this.props;
    const { text, jsonError, copied, clearFeedback } = this.state;
    const textareaId = `json-field-${setting.key}`;
    const descId = setting.description ? `json-desc-${setting.key}` : undefined;
    const isEmpty = !text;

    return (
      <div className={`form-group${jsonError ? " field-error" : ""}`}>
        <label className="control-label" htmlFor={textareaId}>
          {setting.label}
          {setting.required && <span className="required-field">Required</span>}
        </label>
        <div className="json-field-textarea-wrap">
          <textarea
            id={textareaId}
            className="form-control"
            name={setting.key}
            value={text}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            disabled={disabled}
            readOnly={readOnly}
            aria-describedby={descId}
          />
          <div className="json-field-actions">
            <span className="json-field-copied-feedback" aria-live="polite">
              {copied ? "Copied!" : ""}
            </span>
            <span className="json-field-cleared-feedback" aria-live="polite">
              {clearFeedback ? "Cleared! Ctrl-Z / Cmd-Z to recover." : ""}
            </span>
            <button
              type="button"
              aria-label="Copy to clipboard"
              onClick={this.handleCopy}
              onMouseDown={this.preventButtonBlur}
              disabled={isEmpty}
            >
              <CopyIcon />
            </button>
            <button
              type="button"
              aria-label="Clear field"
              onClick={this.handleClearClick}
              onMouseDown={this.preventButtonBlur}
              disabled={disabled || readOnly || isEmpty}
            >
              <XCloseIcon />
            </button>
          </div>
        </div>
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
