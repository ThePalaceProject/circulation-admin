import * as React from "react";
import Button from "./Button";

export interface FormProps {
  /** The fields and other content of the form. */
  content?: React.ReactNode;
  /** Gets the form's `FormData` when the submit button is clicked. */
  onSubmit: (data: FormData) => void | Promise<unknown>;
  title?: React.ReactNode;
  className?: string;
  /** Adds a hidden input with this name and `hiddenValue`. */
  hiddenName?: string;
  hiddenValue?: string;
  /** The submit button's content. The default is "Submit". */
  buttonContent?: React.ReactNode;
  buttonClass?: string;
  disableButton?: boolean;
  /** Leaves out the submit button. Then call `onSubmit` from your own
   *  control. */
  withoutButton?: boolean;
  // The alerts show above the content. When `errorText`, `successText`, or
  // `warningText` changes, the last alert shown gets the focus.
  /** Shows a red alert. */
  errorText?: React.ReactNode;
  /** Shows a green alert, but not while `errorText` is set. */
  successText?: React.ReactNode;
  /** Shows a blue alert. */
  infoText?: React.ReactNode;
  /** Shows an `alert-loading` alert. */
  loadingText?: React.ReactNode;
  /** Shows a yellow alert. */
  warningText?: React.ReactNode;
}

/**
 * A `<form>` with alerts and a submit button. Copied from
 * library-simplified-reusable-components 1.3.18, with the same DOM, class
 * names, and props. That package bundles its own copy of React 16, which
 * React 19 cannot render.
 *
 * The submit button's click handler calls `onSubmit`. With `withoutButton`,
 * the form has no other submit handler. Read the `<form>` element through
 * `formRef`.
 */
export default class Form extends React.Component<FormProps> {
  messageRef = React.createRef<HTMLElement>();
  formRef = React.createRef<HTMLFormElement>();

  constructor(props: FormProps) {
    super(props);
    this.submit = this.submit.bind(this);
    this.message = this.message.bind(this);
  }

  componentDidUpdate(oldProps: FormProps) {
    if (this.messageRef.current && this.messageRef.current.focus) {
      // If no message changed (for example, the user typed in a field but did
      // not submit again), keep the focus where it is.
      const messageProps = ["errorText", "successText", "warningText"];
      const hasNewMessage = messageProps.some(
        (prop) => oldProps[prop] !== this.props[prop]
      );
      if (hasNewMessage) {
        this.messageRef.current.focus();
      }
    }
  }

  async submit(event: React.MouseEvent) {
    event.preventDefault();
    const data = new window.FormData(this.formRef.current);
    await this.props.onSubmit(data);
  }

  message(text: any, messageType: string): React.ReactElement {
    // An element message keeps its own type and gets the alert props. Its own
    // props replace any with the same name. The element is also rendered as its
    // own child, so a DOM element shows up inside a copy of itself. Do not give
    // it an `id`. A component element, such as `ErrorMessage`, may ignore these
    // props.
    return React.createElement(
      text.type || "p",
      {
        className: `alert alert-${messageType}`,
        role: "alert",
        ref: this.messageRef,
        tabIndex: -1,
        ...text.props,
      },
      text
    );
  }

  render(): React.JSX.Element {
    const className = `clearfix${this.props.className ? ` ${this.props.className}` : ""}`;
    return (
      <form ref={this.formRef} className={className}>
        {this.props.errorText && this.message(this.props.errorText, "danger")}
        {this.props.successText &&
          !this.props.errorText &&
          this.message(this.props.successText, "success")}
        {this.props.infoText && this.message(this.props.infoText, "info")}
        {this.props.loadingText &&
          this.message(this.props.loadingText, "loading")}
        {this.props.warningText &&
          this.message(this.props.warningText, "warning")}
        {this.props.title && (
          <label className="form-title">{this.props.title}</label>
        )}
        {this.props.hiddenName && (
          <input
            type="hidden"
            name={this.props.hiddenName}
            value={this.props.hiddenValue}
          />
        )}
        {this.props.content}
        <br />
        {!this.props.withoutButton && (
          <Button
            callback={this.submit}
            content={this.props.buttonContent}
            className={this.props.buttonClass}
            disabled={this.props.disableButton}
          />
        )}
      </form>
    );
  }
}
