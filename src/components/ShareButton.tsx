import * as React from "react";
import LoadingIcon from "./icons/LoadingIcon";
import ShareIcon from "./icons/ShareIcon";

export interface ShareButtonProps {
  disabled?: boolean;
  pending?: boolean;
  submit?: any;
  text?: string;
  type?: "submit" | "reset" | "button";
}

export default function ShareButton({
  disabled,
  pending,
  submit,
  text = "Share",
  type = "button",
}: ShareButtonProps): JSX.Element {
  return (
    <div>
      <button className="btn" disabled={disabled} type={type} onClick={submit}>
        <span>
          {text}
          {pending ? <LoadingIcon /> : <ShareIcon />}
        </span>
      </button>
    </div>
  );
}
