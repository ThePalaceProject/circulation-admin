import * as React from "react";
import { ButtonInput } from "react-bootstrap";

export default class ButtonForm extends React.Component<ButtonFormProps, any> {
  render(): JSX.Element {
    return (
      <form>
        <ButtonInput value={this.props.label} onClick={this.click.bind(this)} />
      </form>
    );
  }

  click(event) {
    let link = this.props.link;
    let label = this.props.label;
    let csrfToken = this.props.csrfToken;
    let formData = new FormData();
    formData.append("csrf_token", csrfToken);
    fetch(link, {
      credentials: "same-origin",
      method: "POST",
      body: formData
    }).then((response) => {
      if (response.status !== 200) {
        alert(label + " failed");
      } else {
        window.location.reload();
      }
    });
  }
}