import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import ButtonForm from "./ButtonForm";
import BookEditForm from "./BookEditForm";
import ErrorMessage from "./ErrorMessage";
import { BookData, RolesData, MediaData, LanguagesData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";

export interface BookDetailsEditorStateProps {
  bookData?: BookData;
  roles?: RolesData;
  media?: MediaData;
  languages?: LanguagesData;
  bookAdminUrl?: string;
  fetchError?: FetchErrorData;
  editError?: FetchErrorData;
  isFetching?: boolean;
}

export interface BookDetailsEditorDispatchProps {
  fetchBook: (url: string) => void;
  fetchRoles: () => void;
  fetchMedia: () => void;
  fetchLanguages: () => void;
  editBook: (url: string, data: FormData | null) => Promise<any>;
}

export interface BookDetailsEditorOwnProps {
  bookUrl?: string;
  csrfToken: string;
  store?: Store<State>;
  refreshCatalog?: () => Promise<any>;
}

export interface BookDetailsEditorProps extends React.Props<BookDetailsEditor>, BookDetailsEditorStateProps, BookDetailsEditorDispatchProps, BookDetailsEditorOwnProps {}

/** Tab for editing a book's metadata on the book details page. */
export class BookDetailsEditor extends React.Component<BookDetailsEditorProps, void> {
  constructor(props) {
    super(props);
    this.editBook = this.editBook.bind(this);
    this.hide = this.hide.bind(this);
    this.restore = this.restore.bind(this);
    this.refreshMetadata = this.refreshMetadata.bind(this);
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
            <div className="editor-fetching-container">
              { this.props.isFetching &&
                <h4>
                  Updating
                  <i className="fa fa-spinner fa-spin"></i>
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
                    onClick={this.hide}
                    />
                }
                { this.props.bookData.restoreLink &&
                  <ButtonForm
                    disabled={this.props.isFetching}
                    label="Restore"
                    onClick={this.restore}
                    />
                }
                { this.props.bookData.refreshLink &&
                  <ButtonForm
                    disabled={this.props.isFetching}
                    label="Refresh Metadata"
                    onClick={this.refreshMetadata}
                    />
                }
              </div>
            }

            { this.props.bookData.editLink &&
              <BookEditForm
                {...this.props.bookData}
                roles={this.props.roles}
                media={this.props.media}
                languages={this.props.languages}
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
      this.props.fetchRoles();
      this.props.fetchMedia();
      this.props.fetchLanguages();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bookUrl && nextProps.bookUrl !== this.props.bookUrl) {
      let bookAdminUrl = nextProps.bookUrl.replace("works", "admin/works");
      this.props.fetchBook(bookAdminUrl);
    }
  }

  hide() {
    return this.editBook(this.props.bookData.hideLink.href);
  }

  restore() {
    return this.editBook(this.props.bookData.restoreLink.href);
  }

  refreshMetadata() {
    return this.editBook(this.props.bookData.refreshLink.href);
  }

  refresh() {
    this.props.fetchBook(this.props.bookAdminUrl);
    this.props.refreshCatalog();
  };

  editBook(url) {
    return this.props.editBook(url, null).then(this.refresh);
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    bookData: state.editor.book.data || ownProps.bookData,
    roles: state.editor.roles.data,
    media: state.editor.media.data,
    languages: state.editor.languages.data,
    isFetching: state.editor.book.isFetching || state.editor.roles.isFetching || state.editor.media.isFetching || state.editor.languages.isFetching,
    fetchError: state.editor.book.fetchError || state.editor.roles.fetchError || state.editor.media.fetchError || state.editor.languages.fetchError,
    editError: state.editor.book.editError
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher({ adapter: editorAdapter });
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    editBook: (url, data) => dispatch(actions.editBook(url, data)),
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url)),
    fetchRoles: () => dispatch(actions.fetchRoles()),
    fetchMedia: () => dispatch(actions.fetchMedia()),
    fetchLanguages: () => dispatch(actions.fetchLanguages())
  };
}

const ConnectedBookDetailsEditor = connect<BookDetailsEditorStateProps, BookDetailsEditorDispatchProps, BookDetailsEditorOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(BookDetailsEditor);

export default ConnectedBookDetailsEditor;
