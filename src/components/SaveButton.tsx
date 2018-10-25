import * as React from "react";

export interface SaveButtonProps {
  disabled: boolean;
  submit?: any;
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
       onClick={this.props.submit}
    >{text}</button>
   );
 }

}
