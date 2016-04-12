import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import ComplaintForm from "./ComplaintForm";
import ButtonForm from "./ButtonForm";
import { BookData, PostComplaint } from "../interfaces";
import { FetchErrorData } from "opds-browser/lib/interfaces";

export interface ComplaintsProps {
  bookUrl: string;
  book: BookData;
  complaints?: any;
  fetchError?: FetchErrorData;
  store?: Redux.Store;
  csrfToken: string;
  fetchComplaints?: (url: string) => Promise<any>;
  postComplaint?: PostComplaint;
  resolveComplaints?: (url: string, data: FormData) => Promise<any>;
  isFetching?: boolean;
}

export class Complaints extends React.Component<ComplaintsProps, any> {
  constructor(props) {
    super(props);
    this.resolve = this.resolve.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.props.book &&
          <div>
            <h2>
              {this.props.book.title}
            </h2>
            <div style={{ height: "35px" }}>
              { this.props.isFetching &&
                <h4>
                  Updating
                  <i className="fa fa-spinner fa-spin" style={{ marginLeft: "10px" }}></i>
                </h4>
              }
            </div>
          </div>
        }

        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        }

        <h3>Complaints</h3>
        { this.props.complaints && Object.keys(this.props.complaints).length > 0 ?
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              { Object.keys(this.props.complaints).map(type =>
                <tr key={type} className="complaint">
                  <td className="complaintType">{this.readableComplaintType(type)}</td>
                  <td className="complaintCount">{this.props.complaints[type]}</td>
                  <td>
                    <ButtonForm
                      className="resolveComplaintsForm"
                      bsSize={"small"}
                      csrfToken={this.props.csrfToken}
                      data={{ type }}
                      disabled={this.props.isFetching}
                      label="Resolve"
                      link={this.resolveComplaintsUrl()}
                      submit={this.resolve}
                      refresh={this.refresh}
                      />
                  </td>
                </tr>
              ) }
            </tbody>
          </table> :
          <div><strong>None found.</strong></div>
        }

        <br />

        { this.props.book && this.props.book.issuesLink &&
          <ComplaintForm
            disabled={this.props.isFetching}
            complaintUrl={this.props.book.issuesLink.href}
            postComplaint={this.props.postComplaint}
            refreshComplaints={this.refresh} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchComplaints(this.complaintsUrl());
    }
  }

  complaintsUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/complaints";
  }

  resolveComplaintsUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/resolve_complaints";
  }

  readableComplaintType(type) {
    let match = type.match(/\/terms\/problem\/(.+)$/);
    if (match) {
      return match[1].replace("-", " ");
    } else {
      return type;
    }
  }

  refresh() {
    this.props.fetchComplaints(this.complaintsUrl());
    this.props.refreshBrowser();
  };

  resolve(url: string, data: FormData) {
    if (window.confirm("Are you sure you want to resolve all complaints of this type?")) {
      return this.props.resolveComplaints(url, data);
    } else {
      return new Promise((resolve, reject) => {
        reject();
      })
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookData: state.editor.book.data,
    complaints: state.editor.complaints.data,
    isFetching: state.editor.complaints.isFetching,
    fetchError: state.editor.complaints.fetchError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher);
  return {
    fetchComplaints: (url) => dispatch(actions.fetchComplaints(url)),
    postComplaint: (url, data) => dispatch(actions.postComplaint(url, data)),
    resolveComplaints: (url, data) => dispatch(actions.resolveComplaints(url, data))
  };
}

const ConnectedComplaints = connect(
  mapStateToProps,
  mapDispatchToProps
)(Complaints);

export default ConnectedComplaints;
