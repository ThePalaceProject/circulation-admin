import * as React from "react";
import { Input, ButtonInput } from "react-bootstrap";
import { BookData } from "../interfaces";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  label: string;
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
        value: (this.refs as any).input.getValue(),
        checked: (this.refs as any).input.getChecked()
      });
    }
  }
}

export interface EditFormProps extends BookData {
  csrfToken: string;
  disabled: boolean;
  refresh: () => any;
  editBook: (url: string, data: FormData) => Promise<any>;
}

export default class EditForm extends React.Component<EditFormProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      audience: this.props.audience,
      fiction: this.props.fiction
    }
  }

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
          ref="audience"
          value={this.props.audience}
          onChange={this.handleAudienceChange.bind(this)}
        >
          <option value="Children">Children</option>
          <option value="Young Adult">Young Adult</option>
          <option value="Adult">Adult</option>
          <option value="Adults Only">Adults Only</option>
        </EditableInput>
        { (this.state.audience === "Children" || this.state.audience === "Young Adult") &&
          <div className="form-group">
            <label>Target Age Range</label>
            <div className="form-inline">
              <EditableInput
                type="text"
                label=""
                disabled={this.props.disabled}
                name="target_age_min"
                value={this.props.targetAgeRange[0]}
                style={{width: "50px"}}
                />
              <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
              <EditableInput
                type="text"
                label=""
                disabled={this.props.disabled}
                name="target_age_max"
                value={this.props.targetAgeRange[1]}
                style={{width: "50px"}}
                />
            </div>
          </div>
        }
        <div className="form-group">
          <label>Fiction Classification</label>
          <div className="form-inline">
            <EditableInput
              type="radio"
              disabled={this.props.disabled}
              name="fiction"
              label=" Fiction"
              value="fiction"
              ref="fiction"
              checked={this.state.fiction}
              onChange={this.handleFictionChange.bind(this)}
              />
            &nbsp; &nbsp; &nbsp;
            <EditableInput
              type="radio"
              disabled={this.props.disabled}
              name="fiction"
              label=" Nonfiction"
              value="nonfiction"
              ref="nonfiction"
              checked={!this.state.fiction}
              onChange={this.handleNonfictionChange.bind(this)}
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

  componentWillReceiveProps(props) {
    if (props.audience && props.audience !== this.props.audience) {
      this.setState({
        audience: props.audience
      });
    }
    if (props.fiction !== this.props.fiction) {
      this.setState({
        fiction: props.fiction
      });
    }
  }

  handleAudienceChange() {
    let audience = (this.refs as any).audience;
    let value = (audience.refs as any).input.getValue();
    this.setState({
      audience: value
    });
  }

  handleFictionChange() {
    let fiction = (this.refs as any).fiction;
    let value = (fiction.refs as any).input.getChecked();
    this.setState({
      fiction: value
    });
  }

  handleNonfictionChange() {
    let nonfiction = (this.refs as any).nonfiction;
    let value = (nonfiction.refs as any).input.getChecked();
    this.setState({
      fiction: !value
    });
  }

  save(event) {
    event.preventDefault();

    let data = new FormData(this.refs["form"] as any);
    this.props.editBook(this.props.editLink.href, data).then(response => {
      this.props.refresh();
    });
  }
};