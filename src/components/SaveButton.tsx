import * as React from "react";

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
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render(): JSX.Element {
   let text = this.props.text || "Save";
   return (
     <button
       type="submit"
       className="btn btn-default"
       disabled={this.props.disabled}
       onClick={this.handleSubmit}
    >{text}</button>
   );
 }

 handleSubmit(event) {
   event.preventDefault();
   let data = new (window as any).FormData(this.props.form as any);
   this.props.handleData && this.props.handleData(data);
   this.props.save(data);
 }
}
