import * as React from "react";

export interface SaveButtonProps {
  disabled: boolean;
  save: (data) => void;
  handleData?: (data) => void;
  form: any;
}

export default class SaveButton extends React.Component<SaveButtonProps, void> {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render(): JSX.Element {
   return (
     <button
       type="submit"
       className="btn btn-default"
       disabled={this.props.disabled}
       onClick={this.handleSubmit}
    >Submit</button>
   );
 }

 handleSubmit(event) {
   event.preventDefault();
   let data = new (window as any).FormData(this.props.form as any);
   data = (this.props.handleData && this.props.handleData(data)) || data;
   this.props.save(data);
 }
}
