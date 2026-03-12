import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import {
  bookMetadataApi,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/bookMetadata/bookMetadataSlice";
import ErrorMessage from "../shared/ErrorMessage";
import ComplaintForm from "./ComplaintForm";
import { Button } from "library-simplified-reusable-components";
import { BookData, PostComplaint } from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { RootState } from "../../store";
import { formatString } from "../../utils/sharedFunctions";
import UpdatingLoader from "../shared/UpdatingLoader";

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
  store?: Store<RootState>;
  csrfToken: string;
  refreshCatalog: () => Promise<any>;
}

export interface ComplaintsProps
  extends ComplaintsStateProps,
    ComplaintsDispatchProps,
    ComplaintsOwnProps {}

/** Tab on the book details page that shows existing complaints and lets an admin resolve
    complaints or add new complaints. */
export class Complaints extends React.Component<ComplaintsProps> {
  constructor(props) {
    super(props);
    this.resolve = this.resolve.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="complaints">
        {this.props.book && (
          <div>
            <h2>{this.props.book.title}</h2>
            <UpdatingLoader show={this.props.isFetching} />
          </div>
        )}

        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        )}

        <h3>Complaints</h3>
        {this.props.complaints &&
        Object.keys(this.props.complaints).length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.props.complaints).map((type) => (
                <tr key={type} className="complaint">
                  <td className="complaint-type">
                    {this.readableComplaintType(type)}
                  </td>
                  <td className="complaint-count">
                    {this.props.complaints[type]}
                  </td>
                  <td className="complaint-resolve">
                    <Button
                      className="btn-sm top-align"
                      content="Resolve"
                      disabled={this.props.isFetching}
                      callback={() => this.resolve(type)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            <strong>None found.</strong>
          </div>
        )}

        <br />

        {this.props.book && this.props.book.issuesLink && (
          <ComplaintForm
            disabled={this.props.isFetching}
            complaintUrl={this.props.book.issuesLink.href}
            postComplaint={this.props.postComplaint}
            refreshComplaints={this.refresh}
          />
        )}
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchComplaints(this.complaintsUrl());
    }
  }

  complaintsUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/complaints";
  }

  resolveComplaintsUrl() {
    return (
      this.props.bookUrl.replace("works", "admin/works") + "/resolve_complaints"
    );
  }

  readableComplaintType(type: string) {
    const match = type.match(/\/terms\/problem\/(.+)$/);
    if (match) {
      return formatString(match[1], ["-"]);
    } else {
      return type;
    }
  }

  refresh() {
    this.props.fetchComplaints(this.complaintsUrl());
    this.props.refreshCatalog();
  }

  resolve(type: string) {
    const readableType = this.readableComplaintType(type);
    if (
      window.confirm(`Resolve all "${readableType}" complaints for this book?`)
    ) {
      const url = this.resolveComplaintsUrl();
      const data = new (window as any).FormData();
      data.append("type", type);
      return this.props.resolveComplaints(url, data).then(this.refresh);
    }
  }
}

function mapStateToProps(state, ownProps) {
  const complaintsUrl = ownProps.bookUrl
    ? ownProps.bookUrl.replace("works", "admin/works") + "/complaints"
    : undefined;
  const result = complaintsUrl
    ? bookMetadataApi.endpoints.getComplaints.select(complaintsUrl)(state)
    : { data: undefined, isLoading: false, error: undefined };
  return {
    complaints: result.data?.complaints ?? null,
    isFetching: isResultFetching(result),
    fetchError: result.error ? rtkErrorToFetchError(result.error) : null,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const complaintsUrl = ownProps.bookUrl
    ? ownProps.bookUrl.replace("works", "admin/works") + "/complaints"
    : undefined;
  const resolveUrl = ownProps.bookUrl
    ? ownProps.bookUrl.replace("works", "admin/works") + "/resolve_complaints"
    : undefined;
  return {
    fetchComplaints: (_url: string) =>
      complaintsUrl &&
      dispatch(bookMetadataApi.endpoints.getComplaints.initiate(complaintsUrl)),
    postComplaint: (url: string, data: { type: string }) =>
      dispatch(bookMetadataApi.endpoints.postComplaint.initiate({ url, data })),
    resolveComplaints: (_url: string, data: FormData) =>
      resolveUrl &&
      dispatch(
        bookMetadataApi.endpoints.resolveComplaints.initiate({
          url: resolveUrl,
          data,
        })
      ),
  };
}

const ConnectedComplaints = connect<
  ComplaintsStateProps,
  ComplaintsDispatchProps,
  ComplaintsOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(Complaints);

export default ConnectedComplaints;
