import * as React from "react";

export interface LoadButtonProps {
  text?: string;
  show: boolean;
}

function UpdatingLoader(props: LoadButtonProps) {
  return (
    <div className="updating-loader-container">
      {props.show && (
        <div className="updating-loader">
          {props.text || "Updating"}
          <i className="fa fa-spinner fa-spin"></i>
        </div>
      )}
    </div>
  );
}

export default UpdatingLoader;
