import * as React from "react";
import { Input, ButtonInput } from "react-bootstrap";

export default class ComplaintForm extends React.Component<ComplaintFormProps, any> {
  constructor(props) {
    super(props);
    this.state = { errors: [] };
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
          <div key={i} style={{ color: "red", marginBottom: "5px" }}>{error}</div>
        ) }
        <form onSubmit={this.post.bind(this)} className="form-inline">
          <Input ref="type" type="select" name="type" placeholder="">
            <option value="">select type</option>
            { complaintTypes.map(type => <option key={type} value={type}>{type}</option>) }
          </Input> &nbsp;
          <ButtonInput type="submit" value="Submit" disabled={this.props.disabled} />
        </form>
      </div>
    );
  }

  post(event) {
    event.preventDefault();

    let input = this.refs["type"] as Input;
    let select = input.refs["input"] as HTMLSelectElement;

    if (select.value) {
      this.setState({ errors: [] });
    } else {
      this.setState({ errors: ["You must select a complaint type!"] });
      return;
    }

    let data = {
      type: "http://librarysimplified.org/terms/problem/" + select.value
    };

    this.props.postComplaint(this.props.complaintUrl, data).then(response => {
      this.props.refreshComplaints();
      this.resetForm();
    }).catch(err => {
      this.setState({ errors: ["Couldn't post complaint."] });
    });
  }

  resetForm() {
    let input = this.refs["type"] as Input;
    let select = input.refs["input"] as HTMLSelectElement;
    select.value = "";
  }
}