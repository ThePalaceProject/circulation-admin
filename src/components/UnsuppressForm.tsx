import * as React from "react";
import { ButtonInput } from "react-bootstrap";

export default class UnsuppressForm extends React.Component<SuppressFormProps, any> {
  render(): JSX.Element {
    return (
      <form>
        <ButtonInput value="Unsuppress" onClick={this.unsuppress.bind(this)} />
      </form>
    );
  }

  unsuppress(event) {
    let link = this.props.link;
    let csrfToken = this.props.csrfToken;
    let formData = new FormData();
    formData.append("csrf_token", csrfToken);
    fetch(link, {
      credentials: "same-origin",
      method: "POST",
      body: formData
    }).then((response) => {
      if (response.status !== 200) {
        alert("Failed to unsuppress book");
      } else {
        window.location.reload();
      }
    });
  }
}