import * as React from "react";
import EditableSelect from "./EditableSelect";
import { PostComplaint } from "../interfaces";

export interface ComplaintFormProps {
  disabled?: boolean;
  complaintUrl: string;
  postComplaint: PostComplaint;
  refreshComplaints: () => void;
}

export default class ComplaintForm extends React.Component<ComplaintFormProps, any> {
  constructor(props) {
    super(props);
    this.state = { errors: [] };
    this.post = this.post.bind(this);
  }

  render(): JSX.Element {
    let complaintTypes = [
      "cannot-issue-loan",
      "cannot-render",
      "wrong-title",
      "wrong-author",
      "wrong-audience",
      "cannot-fulfill-loan",
      "bad-description",
      "cannot-return",
      "bad-cover-image",
      "wrong-medium",
      "wrong-age-range",
      "wrong-genre"
    ];

    return (
      <div className="complaintForm">
        <h3>Add Complaint</h3>
        { this.state.errors.map((error, i) =>
          <div className="complaintFormError" key={i} style={{ color: "red", marginBottom: "5px" }}>{error}</div>
        ) }
        <form onSubmit={this.post} className="form-inline">
          <EditableSelect ref="type" name="type" placeholder="" disabled={this.props.disabled}>
            <option value="">complaint type</option>
            { complaintTypes.map(type => <option key={type} value={type}>{type}</option>) }
          </EditableSelect> &nbsp;
          <input className="btn btn-default" type="submit" value="Submit" disabled={this.props.disabled} />
        </form>
      </div>
    );
  }

  post(event) {
    event.preventDefault();

    let value = (this.refs["type"] as EditableSelect).getValue();

    if (value) {
      this.setState({ errors: [] });
    } else {
      this.setState({ errors: ["You must select a complaint type!"] });
      return;
    }

    let data = {
      type: "http://librarysimplified.org/terms/problem/" + value
    };

    this.props.postComplaint(this.props.complaintUrl, data).then(response => {
      this.props.refreshComplaints();
      this.resetForm();
    }).catch(err => {
      this.showPostError();
    });
  }

  showPostError() {
    this.setState({ errors: ["Couldn't post complaint."] });
  }

  resetForm() {
    (this.refs["type"] as any).reset();
  }
}