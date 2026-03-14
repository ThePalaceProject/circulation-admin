import * as React from "react";
import LoadingIcon from "../icons/LoadingIcon";
import ShareIcon from "../icons/ShareIcon";
import { Button } from "../ui/button";

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
      <Button disabled={disabled} type={type} onClick={submit}>
        <span>
          {text}
          {pending ? <LoadingIcon /> : <ShareIcon />}
        </span>
      </Button>
    </div>
  );
}
