import * as React from "react";
import { Input, ButtonInput } from "react-bootstrap";

export class EditableInput extends React.Component<EditableInputProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  render() {
    return (
      <Input type="text" label={this.props.label} ref="input" value={this.state.value} onChange={this.handleChange.bind(this)}/>
    );
  }

  componentWillReceiveProps(props) {
    if (props.value && props.value !== this.props.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleChange() {
    this.setState({
      value: (this.refs as any).input.getValue()
    });
  }
}

export default class EditForm extends React.Component<EditFormProps, any> {
  render(): JSX.Element {
    return (
      <form onSubmit={this.save.bind(this)}>
        <EditableInput ref="title" label="Title" value={this.props.title} />
         <div style={{ float: "left" }}>
          <ButtonInput value="Save" onClick={this.save.bind(this)}/>
        </div>
      </form>
    );
  }

  save(event) {
    event.preventDefault();
    let formData = new FormData();
    formData.append("csrf_token", this.props.csrfToken);
    formData.append("title", (this.refs as any).title.refs.input.getValue());
    fetch(this.props.editLink.href, {
      credentials: "same-origin",
      method: "POST",
      body: formData
    }).then((response) => {
      if (response.status !== 200) {
        alert("edit failed");
      } else {
        this.props.refresh();
      }
    });
  }
};