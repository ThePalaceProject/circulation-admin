import * as React from "react";
import { ButtonInput } from "react-bootstrap";

export default class ButtonForm extends React.Component<ButtonFormProps, any> {
  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.submit.bind(this)}>
        <input
          type="hidden"
          name="csrf_token"
          value={this.props.csrfToken}
          />
        <ButtonInput
          type="submit"
          disabled={this.props.disabled}
          value={this.props.label}
          />
      </form>
    );
  }

  submit(event) {
    event.preventDefault();
    this.props.dispatchEdit();
    let link = this.props.link;
    let label = this.props.label;
    let formData = new FormData(this.refs["form"] as any);
    fetch(link, {
      credentials: "same-origin",
      method: "POST",
      body: formData
    }).then((response) => {
      if (response.status !== 200) {
        response.text().then((responseText) => {
          this.props.dispatchEditFailure({
            status: response.status,
            url: response.url,
            response: responseText
          });
        });
      } else {
        this.props.refresh();
      }
    });
  }
}