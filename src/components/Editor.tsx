import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import ButtonForm from "./ButtonForm";
import EditForm from "./EditForm";

export class Editor extends React.Component<EditorProps, any> {
  render(): JSX.Element {
    let refresh = () => {
      this.props.setBook(this.props.bookUrl);
      this.props.refreshBook();
    };

    return (
      <div>
        { this.props.bookData &&
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
            { this.props.bookData.hideLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Hide"
                link={this.props.bookData.hideLink.href}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                refresh={refresh} />
            }
            { this.props.bookData.restoreLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Restore"
                link={this.props.bookData.restoreLink.href}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                refresh={refresh} />
            }
            { this.props.bookData.refreshLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Refresh Metadata"
                link={this.props.bookData.refreshLink.href}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                refresh={refresh} />
            }
            { this.props.bookData.editLink &&
              <EditForm
                {...this.props.bookData}
                disabled={this.props.isFetching}
                csrfToken={this.props.csrfToken}
                dispatchEdit={this.props.dispatchEdit}
                refresh={refresh} />
            }
          </div>)
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.book) {
      let bookUrl = this.props.book.replace("works", "admin/works");
      this.props.setBook(bookUrl);
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookUrl: state.book.url,
    bookData: state.book.data || ownProps.bookData,
    isFetching: state.book.isFetching
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    dispatchEdit: () => dispatch(actions.editRequest()),
    fetchBook: (url: string) => dispatch(actions.fetchBook(url))
  };
}

function mergeRootProps(stateProps, dispatchProps, componentProps) {
  let setBook = (book: string) => {
    return new Promise((resolve, reject) => {
      dispatchProps.fetchBook(book).then(data => resolve(data));
    });
  };

  return Object.assign({}, componentProps, stateProps, dispatchProps, {
    setBook: setBook
  });
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Editor);

export default ConnectedEditor;
