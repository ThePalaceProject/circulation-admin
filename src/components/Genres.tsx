import * as React from "react";
import { connect } from "react-redux";
import editorAdapter from "../editorAdapter";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import ButtonForm from "./ButtonForm";
import ClassificationsForm from "./ClassificationsForm";
import Classifications  from "./Classifications";
import { BookData, GenreTree, ClassificationData } from "../interfaces";
import { FetchErrorData } from "opds-browser/lib/interfaces";

export interface GenresProps {
  // from parent
  store: Redux.Store;
  bookUrl: string;
  book: BookData;
  csrfToken: string;
  refreshBrowser: () => Promise<any>;

  // from store
  bookAdminUrl?: string;
  genres?: GenreTree;
  classifications?: ClassificationData[];
  fetchError?: FetchErrorData;
  isFetching?: boolean;

  // from actions
  fetchBook?: (url: string) => Promise<any>;
  fetchGenres?: (url: string) => Promise<any>;
  fetchClassifications?: (url: string) => Promise<any>;
  updateGenres?: (url: string, data: FormData) => Promise<any>;
}

export class Genres extends React.Component<GenresProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      genres: [],
      audience: props.book ? props.book.audience : null,
      fiction: props.book ? props.book.fiction : null
    };
    this.updateGenres = this.updateGenres.bind(this);
    this.remove = this.remove.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  render(): JSX.Element {
    let bookGenres = this.bookGenres();

    return (
      <div>
        { this.props.book &&
          <div>
            <h2>
              {this.props.book.title}
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

        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        }

        { this.props.book && this.props.genres && bookGenres &&
          <ClassificationsForm
            book={this.props.book}
            genres={this.props.genres}
            bookGenres={bookGenres}
            disabled={this.props.isFetching}
            />
        }

        { this.props.classifications && this.props.classifications.length > 0 &&
          <Classifications classifications={this.props.classifications} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchGenres("/admin/genres");
      this.props.fetchClassifications(this.classificationsUrl());
    }
  }

  bookGenres() {
    if (!this.props.book || !this.props.book.categories || !this.props.genres) {
      return [];
    }

    return this.props.book.categories.filter(category => {
      return !!this.props.genres["Fiction"][category] ||
        !!this.props.genres["Nonfiction"][category];
    });
  }

  classificationsUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/classifications";
  }

  updateGenresUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/update_genres";
  }

  updateGenres(genres: string[]) {
    let data = new FormData();
    data.append("csrf_token", this.props.csrfToken);
    genres.forEach(genre => data.append("genres", genre));
    return this.props.updateGenres(this.updateGenresUrl(), data);
  }

  refresh() {
    this.props.fetchBook(this.props.bookAdminUrl);
    this.props.fetchClassifications(this.classificationsUrl());
    this.props.refreshBrowser();
  }

  remove(genreToRemove: string) {
    if (window.confirm("Are you sure you want to remove the " + genreToRemove + " genre?")) {
      let genres = this.bookGenres().filter(genre => genre !== genreToRemove);
      return this.updateGenres(genres).then(this.refresh);
    }
  }

  save() {
    // let data = {};
    // this.props.saveClassifications(data).then(response => {
    //   this.props.refresh();
    //   this.resetForm();
    // }).catch(err => {
    //   this.showGenreError();
    // });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    genres: state.editor.genres.genres,
    classifications: state.editor.genres.classifications,
    isFetching: state.editor.genres.isFetchingGenres ||
                state.editor.genres.isUpdatingGenres ||
                state.editor.genres.isFetchingClassifications ||
                state.editor.book.isFetching,
    fetchError: state.editor.genres.fetchError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url)),
    fetchGenres: (url: string) => dispatch(actions.fetchGenres(url)),
    fetchClassifications: (url: string) => dispatch(actions.fetchClassifications(url)),
    updateGenres: (url: string, data: FormData) => dispatch(actions.updateGenres(url, data))
  };
}

const ConnectedGenres = connect<GenresProps>(
  mapStateToProps,
  mapDispatchToProps
)(Genres);

export default ConnectedGenres;