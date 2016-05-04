import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import ButtonForm from "./ButtonForm";
import EditForm from "./EditForm";
import ErrorMessage from "./ErrorMessage";
import { BookData } from "../interfaces";
import { FetchErrorData } from "opds-browser/lib/interfaces";

export interface EditorProps extends React.Props<Editor> {
  bookUrl?: string;
  bookData?: BookData;
  bookAdminUrl?: string;
  fetchError?: FetchErrorData;
  editError?: FetchErrorData;
  csrfToken: string;
  store?: Redux.Store;
  fetchBook?: (url: string) => void;
  refreshBrowser?: () => Promise<any>;
  editBook?: (url: string, data: FormData) => Promise<any>;
  isFetching?: boolean;
}

export class Editor extends React.Component<EditorProps, any> {
  constructor(props) {
    super(props);
    this.editBook = this.editBook.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  render(): JSX.Element {
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

            { (this.props.bookData.hideLink || this.props.bookData.restoreLink || this.props.bookData.refreshLink) &&
              <div className="form-group form-inline">
                { this.props.bookData.hideLink &&
                  <ButtonForm
                    disabled={this.props.isFetching}
                    label="Hide"
                    submit={() => this.editBook(this.props.bookData.hideLink.href)}
                    />
                }
                { this.props.bookData.restoreLink &&
                  <ButtonForm
                    disabled={this.props.isFetching}
                    label="Restore"
                    submit={() => this.editBook(this.props.bookData.restoreLink.href)}
                    />
                }
                { this.props.bookData.refreshLink &&
                  <ButtonForm
                    disabled={this.props.isFetching}
                    label="Refresh Metadata"
                    submit={() => this.editBook(this.props.bookData.refreshLink.href)}
                    />
                }
              </div>
            }

            { this.props.bookData.editLink &&
              <EditForm
                {...this.props.bookData}
                csrfToken={this.props.csrfToken}
                disabled={this.props.isFetching}
                editBook={this.props.editBook}
                refresh={this.refresh} />
            }
          </div>)
        }
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      let bookAdminUrl = this.props.bookUrl.replace("works", "admin/works");
      this.props.fetchBook(bookAdminUrl);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bookUrl && nextProps.bookUrl !== this.props.bookUrl) {
      let bookAdminUrl = nextProps.bookUrl.replace("works", "admin/works");
      this.props.fetchBook(bookAdminUrl);
    }
  }

  refresh() {
    this.props.fetchBook(this.props.bookAdminUrl);
    this.props.refreshBrowser();
  };

  editBook(url) {
    let data = new FormData();
    data.append("csrf_token", this.props.csrfToken);
    return this.props.editBook(url, data).then(this.refresh);
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    bookData: state.editor.book.data || ownProps.bookData,
    isFetching: state.editor.book.isFetching,
    fetchError: state.editor.book.fetchError,
    editError: state.editor.book.editError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    editBook: (url, data) => dispatch(actions.editBook(url, data)),
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url))
  };
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);

export default ConnectedEditor;
