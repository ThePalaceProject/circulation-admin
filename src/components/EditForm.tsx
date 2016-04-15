import * as React from "react";
import { Input, ButtonInput } from "react-bootstrap";
import { BookData } from "../interfaces";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  label: string;
  value: string;
  name: string;
  disabled: boolean;
  type: string;
}

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
        >
        {this.props.children}
      </Input>
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

export interface EditFormProps extends BookData {
  csrfToken: string;
  disabled: boolean;
  refresh: () => any;
  editBook: (url: string, data: FormData) => Promise<any>;
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
          type="select"
          disabled={this.props.disabled}
          name="audience"
          label="Audience"
          value={this.props.audience}
          >
            <option value="Children">Children</option>
            <option value="Young Adult">Young Adult</option>
            <option value="Adult">Adult</option>
            <option value="Adults Only">Adults Only</option>
        </EditableInput>
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