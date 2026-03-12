import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect, ConnectedProps } from "react-redux";
import {
  bookMetadataApi,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/bookMetadata/bookMetadataSlice";
import ErrorMessage from "../shared/ErrorMessage";
import ClassificationsForm from "./ClassificationsForm";
import ClassificationsTable from "./ClassificationsTable";
import { BookData } from "../../interfaces";
import { AppDispatch, RootState } from "../../store";
import UpdatingLoader from "../shared/UpdatingLoader";
import { getBookData } from "../../features/book/bookEditorSlice";

export interface ClassificationsOwnProps {
  // from parent
  store: Store<RootState>;
  csrfToken: string;
  bookUrl: string;
  book: BookData;
  refreshCatalog: () => Promise<any>;
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type ClassificationsProps = ConnectedProps<typeof connector> &
  ClassificationsOwnProps;

/** Tab on the book details page with a table of a book's current classifications and
    a form for editing them. */
export class Classifications extends React.Component<ClassificationsProps> {
  constructor(props) {
    super(props);
    this.refresh = this.refresh.bind(this);
    this.editClassifications = this.editClassifications.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="classifications">
        {this.props.book && (
          <>
            <h2>{this.props.book.title}</h2>
            <UpdatingLoader show={this.props.isFetching} />
          </>
        )}

        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} />
        )}

        {this.props.book && this.props.genreTree && (
          <ClassificationsForm
            book={this.props.book}
            genreTree={this.props.genreTree}
            disabled={this.props.isFetching}
            editClassifications={this.editClassifications}
          />
        )}

        {this.props.classifications &&
          this.props.classifications.length > 0 && (
            <ClassificationsTable
              classifications={this.props.classifications}
            />
          )}
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchGenreTree("/admin/genres");
      this.props.fetchClassifications(this.classificationsUrl());
    }
  }

  classificationsUrl() {
    return (
      this.props.bookUrl.replace("works", "admin/works") + "/classifications"
    );
  }

  editClassificationsUrl() {
    return (
      this.props.bookUrl.replace("works", "admin/works") +
      "/edit_classifications"
    );
  }

  refresh() {
    this.props.fetchBook(this.props.bookAdminUrl);
    this.props.fetchClassifications(this.classificationsUrl());
    this.props.refreshCatalog();
  }

  editClassifications(data: FormData) {
    return this.props
      .editClassifications(this.editClassificationsUrl(), data)
      .then((_response) => {
        this.refresh();
      });
  }
}

function mapStateToProps(state: RootState, ownProps: ClassificationsOwnProps) {
  const classUrl = ownProps.bookUrl
    ? ownProps.bookUrl.replace("works", "admin/works") + "/classifications"
    : undefined;
  const genreResult = bookMetadataApi.endpoints.getGenreTree.select(
    "/admin/genres"
  )(state);
  const classResult = classUrl
    ? bookMetadataApi.endpoints.getClassifications.select(classUrl)(state)
    : { data: undefined, isLoading: false, error: undefined };
  return {
    bookAdminUrl: state.bookEditor.url,
    genreTree: genreResult.data ?? null,
    classifications: classResult.data?.classifications ?? null,
    isFetching:
      isResultFetching(genreResult) ||
      isResultFetching(classResult) ||
      state.bookEditor.isFetching,
    fetchError:
      (genreResult.error ? rtkErrorToFetchError(genreResult.error) : null) ??
      (classResult.error ? rtkErrorToFetchError(classResult.error) : null),
  };
}

function mapDispatchToProps(
  dispatch: AppDispatch,
  _ownProps: ClassificationsOwnProps
) {
  return {
    fetchBook: (url: string) => dispatch(getBookData({ url })),
    fetchGenreTree: (_url: string) =>
      dispatch(
        bookMetadataApi.endpoints.getGenreTree.initiate("/admin/genres")
      ),
    fetchClassifications: (url: string) =>
      dispatch(bookMetadataApi.endpoints.getClassifications.initiate(url)),
    editClassifications: (url: string, data: FormData) =>
      dispatch(
        bookMetadataApi.endpoints.editClassifications.initiate({ url, data })
      ),
  };
}

export default connector(Classifications);
