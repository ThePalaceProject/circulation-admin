import * as React from "react";
import VisibleIcon from "./icons/VisibleIcon";
import HiddenIcon from "./icons/HiddenIcon";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="password-input-wrapper">
        <input {...props} ref={ref} type={showPassword ? "text" : "password"} />
        <button
          type="button"
          className="password-toggle-btn"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <HiddenIcon /> : <VisibleIcon />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
