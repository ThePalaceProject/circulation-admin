import * as React from "react";
import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
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

export interface JsonFieldHandle {
  getValue(): any;
  clear(): void;
}

const JsonField = forwardRef<JsonFieldHandle, JsonFieldProps>(
  function JsonField({ setting, value, disabled, readOnly, onChange }, ref) {
    const [text, setText] = useState(() => valueToText(value));
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const [previousText, setPreviousText] = useState<string | null>(null);
    const [clearFeedback, setClearFeedback] = useState(false);
    const [focused, setFocused] = useState(false);

    const copyTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
    const clearFeedbackTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

    // Sync external value changes to internal text (replaces UNSAFE_componentWillReceiveProps).
    const [prevValue, setPrevValue] = useState(value);
    if (prevValue !== value) {
      setPrevValue(value);
      setText(valueToText(value));
      setJsonError(null);
      setPreviousText(null);
      setClearFeedback(false);
      setCopied(false);
      setCopyFailed(false);
      cancelTimer(clearFeedbackTimeoutId);
      cancelTimer(copyTimeoutId);
    }

    useEffect(() => {
      return () => {
        cancelTimer(copyTimeoutId);
        cancelTimer(clearFeedbackTimeoutId);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getValue() {
          const { parsed, error } = parseJson(text);
          return error ? undefined : parsed;
        },
        clear() {
          cancelTimer(clearFeedbackTimeoutId);
          cancelTimer(copyTimeoutId);
          setText("");
          setJsonError(null);
          setCopied(false);
          setCopyFailed(false);
          setPreviousText(null);
          setClearFeedback(false);
          if (onChange) onChange(null);
        },
      }),
      [text, onChange]
    );

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      const newText = e.target.value;
      const { parsed, error } = parseJson(newText);
      cancelTimer(clearFeedbackTimeoutId);
      cancelTimer(copyTimeoutId);
      setText(newText);
      setJsonError(error);
      setPreviousText(null);
      setClearFeedback(false);
      setCopied(false);
      setCopyFailed(false);
      if (!error && onChange) {
        onChange(newText.trim() ? parsed : null);
      }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && previousText !== null) {
        e.preventDefault();
        cancelTimer(clearFeedbackTimeoutId);
        const { parsed, error } = parseJson(previousText);
        setText(previousText);
        setJsonError(error);
        setPreviousText(null);
        setClearFeedback(false);
        if (!error && onChange) {
          onChange(previousText.trim() ? parsed : null);
        }
      }
    }

    function handleCopy() {
      cancelTimer(copyTimeoutId);

      function applyCopyResult(success: boolean) {
        setCopied(success);
        setCopyFailed(!success);
        copyTimeoutId.current = setTimeout(() => {
          setCopied(false);
          setCopyFailed(false);
          copyTimeoutId.current = null;
        }, 2000);
      }

      if (!navigator.clipboard) {
        applyCopyResult(false);
        return;
      }
      navigator.clipboard.writeText(text).then(
        () => applyCopyResult(true),
        () => applyCopyResult(false)
      );
    }

    function handleClearClick() {
      cancelTimer(clearFeedbackTimeoutId);
      cancelTimer(copyTimeoutId);
      setClearFeedback(true);
      clearFeedbackTimeoutId.current = setTimeout(() => {
        setClearFeedback(false);
        clearFeedbackTimeoutId.current = null;
      }, 5000);
      setText("");
      setJsonError(null);
      setCopied(false);
      setCopyFailed(false);
      setPreviousText(text);
      if (onChange) onChange(null);
    }

    // Prevents buttons from stealing focus from the textarea.
    function preventButtonBlur(e: React.MouseEvent) {
      e.preventDefault();
    }

    const textareaId = `json-field-${setting.key}`;
    const descId = setting.description ? `json-desc-${setting.key}` : undefined;
    const errorId = `json-error-${setting.key}`;
    const showErrorMsg = focused || !!jsonError;
    const describedBy =
      [descId, jsonError ? errorId : undefined].filter(Boolean).join(" ") ||
      undefined;
    const isEmpty = !text;

    return (
      <div
        className={`form-group json-field-group${
          jsonError ? " field-error" : ""
        }`}
      >
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
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={jsonError ? true : undefined}
            aria-describedby={describedBy}
          />
          <div className="json-field-actions">
            <span className="json-field-copied-feedback" aria-live="polite">
              {copied ? "Copied!" : ""}
            </span>
            <span
              className="json-field-copy-failed-feedback"
              aria-live="assertive"
            >
              {copyFailed ? "Copy failed." : ""}
            </span>
            <span className="json-field-cleared-feedback" aria-live="polite">
              {clearFeedback ? "Cleared! Ctrl-Z / Cmd-Z to recover." : ""}
            </span>
            <button
              type="button"
              aria-label="Copy to clipboard"
              onClick={handleCopy}
              onMouseDown={preventButtonBlur}
              disabled={isEmpty}
            >
              <CopyIcon />
            </button>
            <button
              type="button"
              aria-label="Clear field"
              onClick={handleClearClick}
              onMouseDown={preventButtonBlur}
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
        {showErrorMsg && (
          <p id={errorId} className="json-field-error-msg">
            {jsonError ?? ""}
          </p>
        )}
      </div>
    );
  }
);

JsonField.displayName = "JsonField";

function cancelTimer(
  ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
) {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

function valueToText(value: any): string {
  if (value === null || value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

function parseJson(s: string): { parsed: any; error: string | null } {
  if (!s.trim()) return { parsed: null, error: null };
  try {
    return { parsed: JSON.parse(s), error: null };
  } catch (err) {
    return { parsed: null, error: (err as Error).message };
  }
}

export default JsonField;
