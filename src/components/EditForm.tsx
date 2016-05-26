import * as React from "react";
import { Input, ButtonInput } from "react-bootstrap";
import { BookData } from "../interfaces";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  label?: string;
  value?: string;
  checked?: boolean;
  name: string;
  disabled: boolean;
  type: string;
  onChange?: () => any;
}

export class EditableInput extends React.Component<EditableInputProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      checked: props.checked
    };
    this.handleChange = this.handleChange.bind(this);
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
        onChange={this.handleChange}
        style={this.props.style}
        placeholder={this.props.placeholder}
        checked={this.state.checked}
        >
        {this.props.children}
      </Input>
    );
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.props.value) {
      this.setState({
        value: props.value
      });
    }
    if (props.checked !== this.props.checked) {
      this.setState({
        checked: props.checked
      });
    }
  }

  handleChange() {
    if (!this.props.onChange || this.props.onChange() !== false) {
      this.setState({
        value: this.getValue(),
        checked: this.getChecked()
      });
    }
  }

  getValue() {
    return (this.refs as any).input.getValue();
  }

  getChecked() {
    return (this.refs as any).input.getChecked();
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
          type="text"
          disabled={this.props.disabled}
          name="subtitle"
          label="Subtitle"
          value={this.props.subtitle}
          />
        <div className="form-group">
          <label>Series</label>
          <div className="form-inline">
            <EditableInput
              style={{ width: "300px" }}
              type="text"
              disabled={this.props.disabled}
              name="series"
              placeholder="Name"
              value={this.props.series}
              />
            <span>&nbsp;&nbsp;</span>
            <EditableInput
              style={{ width: "50px" }}
              type="text"
              disabled={this.props.disabled}
              name="series_position"
              placeholder="#"
              value={this.props.seriesPosition}
              />
          </div>
        </div>
        <EditableInput
          style={{ height: "300px" }}
          type="textarea"
          disabled={this.props.disabled}
          name="summary"
          label="Summary"
          value={this.props.summary}
          />
        <ButtonInput
          disabled={this.props.disabled}
          type="submit"
          value="Save"
          />
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