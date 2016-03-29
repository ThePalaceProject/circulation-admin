import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import ButtonForm from "./ButtonForm";
import EditForm from "./EditForm";
import ErrorMessage from "./ErrorMessage";

export class Editor extends React.Component<EditorProps, any> {
  render(): JSX.Element {
    let refresh = () => {
      this.props.fetchBook(this.props.bookUrl);
      this.props.refreshBook();
    };

    return (
      <div>
        { this.props.bookData && !this.props.fetchError &&
          (<div>
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
            { this.props.editError &&
              <ErrorMessage error={this.props.editError} />
            }
            { this.props.bookData.hideLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Hide"
                link={this.props.bookData.hideLink.href}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                dispatchEditFailure={this.props.dispatchEditFailure}
                refresh={refresh} />
            }
            { this.props.bookData.restoreLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Restore"
                link={this.props.bookData.restoreLink.href}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                dispatchEditFailure={this.props.dispatchEditFailure}
                refresh={refresh} />
            }
            { this.props.bookData.refreshLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Refresh Metadata"
                link={this.props.bookData.refreshLink.href}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                dispatchEditFailure={this.props.dispatchEditFailure}
                refresh={refresh} />
            }
            { this.props.bookData.editLink &&
              <EditForm
                {...this.props.bookData}
                disabled={this.props.isFetching}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                dispatchEditFailure={this.props.dispatchEditFailure}
                refresh={refresh} />
            }
          </div>)
        }
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={refresh} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.book) {
      let bookUrl = this.props.book.replace("works", "admin/works");
      this.props.fetchBook(bookUrl);
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookUrl: state.book.url,
    bookData: state.book.data || ownProps.bookData,
    isFetching: state.book.isFetching,
    fetchError: state.book.fetchError,
    editError: state.book.editError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    dispatchEdit: () => dispatch(actions.editRequest()),
    dispatchEditFailure: (error) => dispatch(actions.editFailure(error)),
    fetchBook: (url: string) => dispatch(actions.fetchBook(url))
  };
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);

export default ConnectedEditor;
