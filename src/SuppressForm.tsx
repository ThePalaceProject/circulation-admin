import * as React from "react";
import { ButtonInput, FormControls } from "react-bootstrap";

export default class SuppressForm extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <form>
        <h3>Suppress <b>{this.props.book.title}</b></h3>
        <FormControls.Static>
          Temporarily hide this book from the collection.
        </FormControls.Static>
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