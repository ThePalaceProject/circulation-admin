import * as React from "react";
import { handleSubmit } from "../sharedFunctions";

export interface SaveButtonProps {
  disabled: boolean;
  save: (data: FormData) => void;
  handleData?: (data) => void;
  form: any;
  text?: string;
}

export default class SaveButton extends React.Component<SaveButtonProps, void> {

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
   let text = this.props.text || "Save";
   return (
     <button
       type="submit"
       className="btn btn-default"
       disabled={this.props.disabled}
       onClick={handleSubmit.bind(this)}
    >{text}</button>
   );
 }

}
