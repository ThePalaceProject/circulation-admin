import * as React from "react";
import { ButtonInput, FormControls } from "react-bootstrap";

export default class SuppressForm extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <form>
        <ButtonInput value="Suppress" onClick={this.suppress.bind(this)} />
      </form>
    );
  }

  suppress(event) {
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
        alert("Failed to suppress book");
      } else {
        window.location.reload();
      }
    });
  }
}