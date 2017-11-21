import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import editorAdapter from "../editorAdapter";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import ClassificationsForm from "./ClassificationsForm";
import ClassificationsTable  from "./ClassificationsTable";
import { BookData, Audience, Fiction, GenreTree, ClassificationData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";

export interface ClassificationsStateProps {
  // from store
  bookAdminUrl?: string;
  genreTree?: GenreTree;
  classifications?: ClassificationData[];
  fetchError?: FetchErrorData;
  isFetching?: boolean;
}

export interface ClassificationsDispatchProps {
  // from actions
  fetchBook?: (url: string) => Promise<any>;
  fetchGenreTree?: (url: string) => Promise<any>;
  fetchClassifications?: (url: string) => Promise<any>;
  editClassifications?: (url: string, data: FormData) => Promise<any>;
}

export interface ClassificationsOwnProps {
  // from parent
  store: Store<State>;
  csrfToken: string;
  bookUrl: string;
  book: BookData;
  refreshCatalog: () => Promise<any>;
}

export interface ClassificationsProps extends ClassificationsStateProps, ClassificationsDispatchProps, ClassificationsOwnProps {};

/** Tab on the book details page with a table of a book's current classifications and
    a form for editing them. */
export class Classifications extends React.Component<ClassificationsProps, void> {
  constructor(props) {
    super(props);
    this.refresh = this.refresh.bind(this);
    this.editClassifications = this.editClassifications.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.props.book &&
          <div>
            <h2>
              {this.props.book.title}
            </h2>
            <div className="classifications-fetching-container">
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
          <ErrorMessage error={this.props.fetchError} />
        }

        { this.props.book && this.props.genreTree &&
          <ClassificationsForm
            book={this.props.book}
            genreTree={this.props.genreTree}
            disabled={this.props.isFetching}
            editClassifications={this.editClassifications}
            />
        }

        { this.props.classifications && this.props.classifications.length > 0 &&
          <ClassificationsTable classifications={this.props.classifications} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchGenreTree("/admin/genres");
      this.props.fetchClassifications(this.classificationsUrl());
    }
  }

  classificationsUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/classifications";
  }

  editClassificationsUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/edit_classifications";
  }

  refresh() {
    this.props.fetchBook(this.props.bookAdminUrl);
    this.props.fetchClassifications(this.classificationsUrl());
    this.props.refreshCatalog();
  }

  editClassifications(data: FormData) {
    return this.props.editClassifications(this.editClassificationsUrl(), data).then(response => {
      this.refresh();
    });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    genreTree: state.editor.classifications.genreTree,
    classifications: state.editor.classifications.classifications,
    isFetching: state.editor.classifications.isFetchingGenreTree ||
                state.editor.classifications.isEditingClassifications ||
                state.editor.classifications.isFetchingClassifications ||
                state.editor.book.isFetching,
    fetchError: state.editor.classifications.fetchError
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher({ adapter: editorAdapter });
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url)),
    fetchGenreTree: (url: string) => dispatch(actions.fetchGenreTree(url)),
    fetchClassifications: (url: string) => dispatch(actions.fetchClassifications(url)),
    editClassifications: (url: string, data: FormData) => dispatch(actions.editClassifications(url, data))
  };
}

const ConnectedClassifications = connect<ClassificationsStateProps, ClassificationsDispatchProps, ClassificationsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Classifications);

export default ConnectedClassifications;