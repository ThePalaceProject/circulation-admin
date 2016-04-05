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
      <Input
        type={this.props.type}
        disabled={this.props.disabled}
        name={this.props.name}
        label={this.props.label}
        ref="input"
        value={this.state.value}
        onChange={this.handleChange.bind(this)}
        style={this.props.style}
        />
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
      <form ref="form" onSubmit={this.save.bind(this)}>
        <input
          type="hidden"
          name="csrf_token"
          value={this.props.csrfToken}
          />
        <EditableInput
          type="text"
          disabled={this.props.disabled}
          name="title"
          label="Title"
          value={this.props.title}
          />
        <EditableInput
          type="text"
          disabled={this.props.disabled}
          name="published"
          label="Publish Date"
          value={this.props.published}
          />
        <EditableInput
          type="text"
          disabled={this.props.disabled}
          name="publisher"
          label="Publisher"
          value={this.props.publisher}
          />
        <EditableInput
          style={{ height: "300px" }}
          type="textarea"
          disabled={this.props.disabled}
          name="summary"
          label="Summary"
          value={this.props.summary}
          />
        <div style={{ float: "left" }}>
          <ButtonInput
            disabled={this.props.disabled}
            type="submit"
            value="Save"
            />
        </div>
      </form>
    );
  }

  save(event) {
    event.preventDefault();

    let data = new FormData(this.refs["form"] as any);

    this.props.editBook(this.props.editLink.href, data).then(response => {
      this.props.refresh();
    });
  }
};