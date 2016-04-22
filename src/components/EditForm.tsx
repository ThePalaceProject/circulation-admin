import * as React from "react";
import { Input, ButtonInput } from "react-bootstrap";
import { BookData } from "../interfaces";

export interface EditableInputProps extends React.HTMLProps<EditableInput> {
  label: string;
  value: string;
  name: string;
  disabled: boolean;
  type: string;
  onChange?: () => any;
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
    if (!this.props.onChange || this.props.onChange() !== false) {
      this.setState({
        value: (this.refs as any).input.getValue()
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
             <div>
             <EditableInput
               type="text"
               label=""
               disabled={this.props.disabled}
               name="target_age_min"
               value={this.props.targetAgeRange[0]}
               style={{width: "50px", float: "left"}}
               />
             <span style={{float: "left", lineHeight: "34px"}}>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
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

  componentWillReceiveProps(props) {
    if (props.audience && props.audience !== this.props.audience) {
      this.setState({
        audience: props.audience
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

  save(event) {
    event.preventDefault();

    let data = new FormData(this.refs["form"] as any);

    this.props.editBook(this.props.editLink.href, data).then(response => {
      this.props.refresh();
    });
  }
};