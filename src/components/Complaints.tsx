import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";

export class Complaints extends React.Component<ComplaintsProps, any> {
  render(): JSX.Element {
    let refresh = () => {
      this.props.fetchComplaints(this.complaintsUrl());
    };

    return (
      <div>
        { this.props.bookData &&
          <div>
            <h2>
              {this.props.bookData.title}
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
        { this.props.complaints &&
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              { Object.keys(this.props.complaints).map(type =>
                <tr key={type}>
                  <td>{this.readableComplaintType(type)}</td>
                  <td>{this.props.complaints[type]}</td>
                </tr>
              ) }
            </tbody>
          </table>
        }
        { this.props.book && this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={refresh} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.book) {
      this.props.fetchComplaints(this.complaintsUrl());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.complaints && nextProps.complaints !== this.props.complaints) {
      this.props.handleComplaintsUpdate(nextProps.complaints);
    }
  }

  complaintsUrl() {
    return this.props.book.url.replace("works", "admin/works") + "/complaints";
  }

  readableComplaintType(type) {
    return type.split("/").pop().replace("-", " ")
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookUrl: ownProps.book.url,
    bookData: state.book.data,
    complaints: state.complaints.data,
    isFetching: state.complaints.isFetching,
    fetchError: state.complaints.fetchError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher);
  return {
    fetchComplaints: (url: string) => dispatch(actions.fetchComplaints(url))
  };
}

const ConnectedComplaints = connect(
  mapStateToProps,
  mapDispatchToProps
)(Complaints);

export default ConnectedComplaints;
