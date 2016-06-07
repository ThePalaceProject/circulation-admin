import * as React from "react";

export interface EditableTextareaProps extends React.HTMLProps<EditableTextarea> {
  label?: string;
  value?: string;
  name: string;
  disabled: boolean;
  onChange?: () => any;
}

export default class EditableTextarea extends React.Component<EditableTextareaProps, any> {
  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    return (
      <div className="form-group">
        { this.props.label &&
          <label className="control-label">{this.props.label}</label>
        }
        <textarea
          className="form-control"
          disabled={this.props.disabled}
          name={this.props.name}
          ref="textarea"
          value={this.state.value}
          onChange={this.handleChange}
          style={this.props.style}
          placeholder={this.props.placeholder}>
        </textarea>
      </div>
    );
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.props.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleChange() {
    if (!this.props.onChange || this.props.onChange() !== false) {
      this.setState({
        value: this.getValue()
      });
    }
  }

  getValue() {
    return (this.refs as any).textarea.value;
  }

  reset() {
    (this.refs as any).textarea.value = "";
  }
}