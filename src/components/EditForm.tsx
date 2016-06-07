import * as React from "react";
import EditableInput from "./EditableInput";
import EditableTextarea from "./EditableTextarea";
import { BookData } from "../interfaces";

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
        <EditableTextarea
          style={{ height: "300px" }}
          disabled={this.props.disabled}
          name="summary"
          label="Summary"
          value={this.props.summary}
          />
        <button
          className="btn btn-default"
          disabled={this.props.disabled}
          type="submit">
          Submit
        </button>
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