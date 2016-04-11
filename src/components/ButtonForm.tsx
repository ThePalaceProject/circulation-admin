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
        { this.props.data &&
          Object.keys(this.props.data).map(key =>
            <input
              key={key}
              type="hidden"
              name={key}
              value={this.props.data[key]}
              />
          )
        }
        <ButtonInput
          bsSize={this.props.bsSize}
          type="submit"
          disabled={this.props.disabled}
          value={this.props.label}
          />
      </form>
    );
  }

  submit(event) {
    event.preventDefault();

    let data = new FormData(this.refs["form"] as any);

    this.props.submit(this.props.link, data).then(response => {
      this.props.refresh();
    });
  }
}