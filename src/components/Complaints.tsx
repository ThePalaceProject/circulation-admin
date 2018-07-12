import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import ComplaintForm from "./ComplaintForm";
import ButtonForm from "./ButtonForm";
import { BookData, PostComplaint } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";

export interface ComplaintsStateProps {
  complaints?: any;
  fetchError?: FetchErrorData;
  isFetching?: boolean;
}

export interface ComplaintsDispatchProps {
  fetchComplaints?: (url: string) => Promise<any>;
  postComplaint?: PostComplaint;
  resolveComplaints?: (url: string, data: FormData) => Promise<any>;
}

export interface ComplaintsOwnProps {
  bookUrl: string;
  book: BookData;
  store?: Store<State>;
  csrfToken: string;
  refreshCatalog: () => Promise<any>;
}

export interface ComplaintsProps extends ComplaintsStateProps, ComplaintsDispatchProps, ComplaintsOwnProps {};

/** Tab on the book details page that shows existing complaints and lets an admin resolve
    complaints or add new complaints. */
export class Complaints extends React.Component<ComplaintsProps, void> {
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
            <div className="complaints-fetching-container">
              { this.props.isFetching &&
                <h4>
                  Updating
                  <i className="fa fa-spinner fa-spin"></i>
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
                  <td className="complaint-type">{this.readableComplaintType(type)}</td>
                  <td className="complaint-count">{this.props.complaints[type]}</td>
                  <td className="complaint-resolve">
                    <ButtonForm
                      className="btn-sm"
                      type="submit"
                      label="Resolve"
                      disabled={this.props.isFetching}
                      onClick={() => this.resolve(type)}
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

  readableComplaintType(type: string) {
    let match = type.match(/\/terms\/problem\/(.+)$/);
    if (match) {
      return match[1].replace("-", " ");
    } else {
      return type;
    }
  }

  refresh() {
    this.props.fetchComplaints(this.complaintsUrl());
    this.props.refreshCatalog();
  };

  resolve(type: string) {
    let readableType = this.readableComplaintType(type);
    if (window.confirm(`Resolve all "${readableType}" complaints for this book?`)) {
      let url = this.resolveComplaintsUrl();
      let data = new (window as any).FormData();
      data.append("type", type);
      return this.props.resolveComplaints(url, data).then(this.refresh);
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    complaints: state.editor.complaints.data,
    isFetching: state.editor.complaints.isFetching,
    fetchError: state.editor.complaints.fetchError
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchComplaints: (url) => dispatch(actions.fetchComplaints(url)),
    postComplaint: (url, data) => dispatch(actions.postComplaint(url, data)),
    resolveComplaints: (url, data) => dispatch(actions.resolveComplaints(url, data))
  };
}

const ConnectedComplaints = connect<ComplaintsStateProps, ComplaintsDispatchProps, ComplaintsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Complaints);

export default ConnectedComplaints;