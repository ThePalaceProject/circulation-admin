import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect, ConnectedProps } from "react-redux";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import BookEditForm from "./BookEditForm";
import ErrorMessage from "./ErrorMessage";
import { AppDispatch, RootState } from "../store";
import { Button } from "library-simplified-reusable-components";
import UpdatingLoader from "./UpdatingLoader";
import { getBookData, submitBookData } from "../features/book/bookEditorSlice";
import BookDetailsEditorSuppression from "./BookDetailsEditorSuppression";
import { bookEditorApiEndpoints } from "../features/book/bookEditorSlice";
import { adminApi } from "../features/api/admin";

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
  // RTK Query subscriptions.
  rolesSubscription;
  mediaSubscription;
  languagesSubscription;

  constructor(props: BookDetailsEditorProps) {
    super(props);
    this.postWithoutPayload = this.postWithoutPayload.bind(this);
    this.hide = this.hide.bind(this);
    this.restore = this.restore.bind(this);
    this.refreshMetadata = this.refreshMetadata.bind(this);
    this.refresh = this.refresh.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (this.props.bookUrl) {
      const bookAdminUrl = this.props.bookUrl.replace("works", "admin/works");
      this.props.fetchBookData(bookAdminUrl);
      this.subscribe();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: BookDetailsEditorProps) {
    if (nextProps.bookUrl && nextProps.bookUrl !== this.props.bookUrl) {
      const bookAdminUrl = nextProps.bookUrl.replace("works", "admin/works");
      this.props.fetchBookData(bookAdminUrl);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    // subscribe to RTK Query caches and fetch, as needed.
    this.rolesSubscription = this.props.fetchRoles();
    this.mediaSubscription = this.props.fetchMedia();
    this.languagesSubscription = this.props.fetchLanguages();
  }

  unsubscribe() {
    // Unsubscribe from the RTK Query caches.
    this.rolesSubscription.unsubscribe();
    this.mediaSubscription.unsubscribe();
    this.languagesSubscription.unsubscribe();
  }

  render(): React.ReactElement {
    const { bookData } = this.props;
    const errorString =
      "response" in this.props.fetchError &&
      typeof this.props.fetchError.response === "string"
        ? this.props.fetchError.response
        : JSON.stringify(this.props.fetchError);
    return (
      <div className="book-details-editor">
        {bookData && !this.props.fetchError && (
          <>
            <h2>{this.props.bookData.title}</h2>

            <UpdatingLoader show={this.props.isFetching} />

            {this.props.editError && (
              <ErrorMessage error={this.props.editError} />
            )}

            {(bookData.suppressPerLibraryLink ||
              bookData.unsuppressPerLibraryLink ||
              bookData.refreshLink) && (
              <div className="form-group form-inline">
                {!!bookData.suppressPerLibraryLink && (
                  <BookDetailsEditorSuppression
                    link={bookData.suppressPerLibraryLink}
                    onConfirm={() =>
                      this.props.suppressBook(
                        bookData.suppressPerLibraryLink.href
                      )
                    }
                    onComplete={this.refresh}
                    buttonDisabled={this.props.isFetching}
                    buttonContent="Hide"
                    buttonTitle="Hide availability for this library."
                    className="left-align"
                    confirmationTitle="Suppressing Availability"
                    confirmationBody={
                      <p>
                        Please confirm your selection to hide this title from
                        your library's catalog. It's important to note that this
                        action affects only your library's catalog and won't
                        impact the availability of the title elsewhere.
                      </p>
                    }
                    confirmationButtonContent="Suppress Availability"
                    confirmationButtonTitle="Suppress availability of this title for this library."
                    defaultSuccessMessage={<p>Availability has been hidden.</p>}
                    defaultFailureMessage={
                      <p>An error occurred. Please try again.</p>
                    }
                  />
                )}
                {!!bookData.unsuppressPerLibraryLink && (
                  <BookDetailsEditorSuppression
                    link={bookData.unsuppressPerLibraryLink}
                    onConfirm={() =>
                      this.props.unsuppressBook(
                        bookData.unsuppressPerLibraryLink.href
                      )
                    }
                    onComplete={this.refresh}
                    buttonDisabled={this.props.isFetching}
                    buttonContent="Restore"
                    buttonTitle="Restore availability for this library."
                    className="left-align"
                    confirmationTitle="Restoring Availability"
                    confirmationBody={
                      <p>
                        Please confirm your selection to make this title visible
                        in your library's catalog. It's important to note that
                        this action affects only your library's catalog and
                        won't impact the availability of the title elsewhere.
                      </p>
                    }
                    confirmationButtonContent="Restore Availability"
                    confirmationButtonTitle="Restore availability of this title for this library."
                    defaultSuccessMessage={
                      <p>Availability has been restored.</p>
                    }
                    defaultFailureMessage={
                      <p>An error occurred. Please try again.</p>
                    }
                  />
                )}
                {bookData.refreshLink && (
                  <Button
                    disabled={this.props.isFetching}
                    content="Refresh Metadata"
                    callback={this.refreshMetadata}
                  />
                )}
              </div>
            )}
            {bookData.editLink && (
              <BookEditForm
                {...bookData}
                roles={this.props.roles.data}
                media={this.props.media.data}
                languages={this.props.languages.data}
                disabled={this.props.isFetching}
                editBook={this.props.postBookData}
                refresh={this.refresh}
              />
            )}
          </>
        )}
        {this.props.fetchError && (
          <ErrorMessage
            error={{
              url: this.props.bookAdminUrl,
              response: errorString,
              status: null,
            }}
            tryAgain={this.refresh}
          />
        )}
      </div>
    );
  }

  hide() {
    return this.postWithoutPayload(this.props.bookData.hideLink.href);
  }

  restore() {
    return this.postWithoutPayload(this.props.bookData.restoreLink.href);
  }

  refreshMetadata() {
    return this.postWithoutPayload(this.props.bookData.refreshLink.href);
  }

  refresh() {
    this.props.fetchBookData(this.props.bookAdminUrl);
    this.props.refreshCatalog();
  }

  postWithoutPayload(url: string) {
    return this.props.postBookData(url, null).then(this.refresh);
  }
}

function mapStateToProps(state: RootState) {
  const roles = adminApi.endpoints.getRoles.select()(state);
  const media = adminApi.endpoints.getMedia.select()(state);
  const languages = adminApi.endpoints.getLanguages.select()(state);

  return {
    bookAdminUrl: state.bookEditor.url,
    bookData: state.bookEditor.data,
    roles,
    media,
    languages,
    isFetching:
      state.bookEditor.isFetching ||
      roles.isLoading ||
      media.isLoading ||
      languages.isLoading,
    fetchError:
      state.bookEditor.fetchError ||
      roles.error ||
      media.error ||
      languages.error,
    editError: state.bookEditor.editError,
  };
}

function mapDispatchToProps(
  dispatch: AppDispatch,
  ownProps: BookDetailsEditorOwnProps
) {
  const fetcher = new DataFetcher({ adapter: editorAdapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    postBookData: (url: string, data: FormData | null) =>
      dispatch(submitBookData({ url, data, csrfToken: ownProps.csrfToken })),
    fetchBookData: (url: string) => dispatch(getBookData({ url })),
    fetchRoles: () => dispatch(adminApi.endpoints.getLanguages.initiate()),
    fetchMedia: () => dispatch(adminApi.endpoints.getMedia.initiate()),
    fetchLanguages: () => dispatch(adminApi.endpoints.getRoles.initiate()),
    suppressBook: (url: string) =>
      dispatch(
        bookEditorApiEndpoints.endpoints.suppressBook.initiate({
          url,
          csrfToken: ownProps.csrfToken,
        })
      ),
    unsuppressBook: (url: string) =>
      dispatch(
        bookEditorApiEndpoints.endpoints.unsuppressBook.initiate({
          url,
          csrfToken: ownProps.csrfToken,
        })
      ),
  };
}

export default connector(BookDetailsEditor);
