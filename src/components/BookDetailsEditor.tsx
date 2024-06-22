import * as React from "react";
import { AsyncThunkAction, Store } from "@reduxjs/toolkit";
import { connect, ConnectedProps } from "react-redux";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import BookEditForm from "./BookEditForm";
import ErrorMessage from "./ErrorMessage";
import { AppDispatch, RootState } from "../store";
import { Button } from "library-simplified-reusable-components";
import UpdatingLoader from "./UpdatingLoader";
import { getBookData } from "../features/book/bookEditorSlice";
import { AsyncThunkConfig } from "@reduxjs/toolkit/dist/createAsyncThunk";

// export interface BookDetailsEditorStateProps {
//   bookData?: BookData;
//   roles?: RolesData;
//   media?: MediaData;
//   languages?: LanguagesData;
//   bookAdminUrl?: string;
//   fetchError?: FetchErrorData;
//   editError?: FetchErrorData;
//   isFetching?: boolean;
// }

// export interface BookDetailsEditorDispatchProps {
//   fetchBook: (url: string) => void;
//   fetchRoles: () => void;
//   fetchMedia: () => void;
//   fetchLanguages: () => void;
//   editBook: (url: string, data: FormData | null) => Promise<any>;
// }

export interface BookDetailsEditorOwnProps {
  bookUrl?: string;
  csrfToken: string;
  store?: Store<RootState>;
  refreshCatalog?: () => Promise<any>;
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type BookDetailsEditorProps = ConnectedProps<typeof connector> &
  BookDetailsEditorOwnProps;

/** Tab for editing a book's metadata on the book details page. */
export class BookDetailsEditor extends React.Component<BookDetailsEditorProps> {
  constructor(props) {
    super(props);
    this.editBook = this.editBook.bind(this);
    this.hide = this.hide.bind(this);
    this.restore = this.restore.bind(this);
    this.refreshMetadata = this.refreshMetadata.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (this.props.bookUrl) {
      const bookAdminUrl = this.props.bookUrl.replace("works", "admin/works");
      this.props.fetchBook(bookAdminUrl);
      this.props.fetchRoles();
      this.props.fetchMedia();
      this.props.fetchLanguages();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.bookUrl && nextProps.bookUrl !== this.props.bookUrl) {
      const bookAdminUrl = nextProps.bookUrl.replace("works", "admin/works");
      this.props.fetchBook(bookAdminUrl);
    }
  }

  render(): JSX.Element {
    return (
      <div className="book-details-editor">
        {this.props.bookData && !this.props.fetchError && (
          <>
            <h2>{this.props.bookData.title}</h2>

            <UpdatingLoader show={this.props.isFetching} />

            {this.props.editError && (
              <ErrorMessage error={this.props.editError} />
            )}

            {(this.props.bookData.hideLink ||
              this.props.bookData.restoreLink ||
              this.props.bookData.refreshLink) && (
              <div className="form-group form-inline">
                {this.props.bookData.hideLink && (
                  <Button
                    className="left-align"
                    disabled={this.props.isFetching}
                    content="Hide"
                    callback={this.hide}
                  />
                )}
                {this.props.bookData.restoreLink && (
                  <Button
                    className="left-align"
                    disabled={this.props.isFetching}
                    content="Restore"
                    callback={this.restore}
                  />
                )}
                {this.props.bookData.refreshLink && (
                  <Button
                    disabled={this.props.isFetching}
                    content="Refresh Metadata"
                    callback={this.refreshMetadata}
                  />
                )}
              </div>
            )}

            {this.props.bookData.editLink && (
              <BookEditForm
                {...this.props.bookData}
                roles={this.props.roles}
                media={this.props.media}
                languages={this.props.languages}
                disabled={this.props.isFetching}
                editBook={this.props.editBook}
                refresh={this.refresh}
              />
            )}
          </>
        )}
        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        )}
      </div>
    );
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
  }

  editBook(url) {
    return this.props.editBook(url, null).then(this.refresh);
  }
}

function mapStateToProps(
  state: RootState,
  ownProps: BookDetailsEditorOwnProps
) {
  return {
    bookAdminUrl: state.bookEditor.url,
    bookData: state.bookEditor.data,
    roles: state.editor.roles.data,
    media: state.editor.media.data,
    languages: state.editor.languages.data,
    isFetching:
      state.bookEditor.isFetching ||
      state.editor.roles.isFetching ||
      state.editor.media.isFetching ||
      state.editor.languages.isFetching,
    fetchError:
      state.bookEditor.fetchError ||
      state.editor.roles.fetchError ||
      state.editor.media.fetchError ||
      state.editor.languages.fetchError,
    editError: state.editor.book.editError,
  };
}

function mapDispatchToProps(
  dispatch: AppDispatch,
  ownProps: BookDetailsEditorOwnProps
) {
  const fetcher = new DataFetcher({ adapter: editorAdapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    editBook: (url, data) => dispatch(actions.editBook(url, data)),
    fetchBook: (url: string) => dispatch(getBookData({ url })), // dispatch(actions.fetchBookAdmin(url)),
    fetchRoles: () => dispatch(actions.fetchRoles()),
    fetchMedia: () => dispatch(actions.fetchMedia()),
    fetchLanguages: () => dispatch(actions.fetchLanguages()),
  };
}

export default connector(BookDetailsEditor);
