import * as React from "react";

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "content" | "type"
> {
  /** Runs on a click, or on a mouse down when `mouseDown` is true. The
   *  matching `onClick` or `onMouseDown` prop replaces it. */
  callback?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** The button's content. The default is "Submit". */
  content?: React.ReactNode;
  /** The default is "submit". Give a button that does not submit its form
   *  the type "button". */
  type?: "submit" | "button" | "reset";
  mouseDown?: boolean;
}

/**
 * A `<button>` with the `btn` class. Copied from
 * library-simplified-reusable-components 1.3.18, with the same DOM, class
 * names, and props. That package bundles its own copy of React 16, which
 * React 19 cannot render. Other props, such as `aria-*` attributes, go to the
 * `<button>`.
 */
export default class Button extends React.Component<ButtonProps> {
  static defaultProps = {
    mouseDown: false,
  };

  render(): React.JSX.Element {
    const { content, className, type, disabled, mouseDown, callback, ...rest } =
      this.props;
    const btnCallback = mouseDown
      ? { onMouseDown: callback }
      : { onClick: callback };
    return (
      <button
        type={type || "submit"}
        className={`btn${className ? ` ${className}` : ""}`}
        disabled={disabled || null}
        {...btnCallback}
        {...rest}
      >
        {content || "Submit"}
      </button>
    );
  }
}
