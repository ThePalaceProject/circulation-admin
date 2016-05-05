import * as React from "react";
import { connect } from "react-redux";
import editorAdapter from "../editorAdapter";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import ButtonForm from "./ButtonForm";
import GenreForm from "./GenreForm";
import Classifications  from "./Classifications";
import { BookData, GenreTree, ClassificationData } from "../interfaces";
import { FetchErrorData } from "opds-browser/lib/interfaces";

export interface GenresProps {
  bookUrl: string;
  bookAdminUrl?: string;
  book: BookData;
  store?: Redux.Store;
  csrfToken: string;
  genres?: GenreTree;
  classifications?: ClassificationData[];
  fetchBook?: (url: string) => Promise<any>;
  fetchGenres?: () => Promise<any>;
  fetchClassifications?: (url: string) => Promise<any>;
  updateGenres?: (url: string, data: FormData) => Promise<any>;
  fetchError?: FetchErrorData;
  refreshBrowser: () => Promise<any>;
  isFetching?: boolean;
}

export class Genres extends React.Component<GenresProps, any> {
  constructor(props) {
    super(props);
    this.updateGenres = this.updateGenres.bind(this);
    this.remove = this.remove.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  render(): JSX.Element {
    let bookGenres = this.bookGenres();
    let genreOptions = this.genreOptions();

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

        <h3>Genres</h3>
        { bookGenres && bookGenres.length > 0 ?
          <table className="table bookGenres">
            <tbody>
              { bookGenres.map(category =>
                <tr key={category} className="bookGenre">
                  <td>{this.fullGenre(category)}</td>
                  <td style={{ textAlign: "right" }}>
                    <ButtonForm
                      className="btn-sm"
                      type="submit"
                      label="Remove"
                      submit={() => this.remove(category)}
                      />
                  </td>
                </tr>
              ) }
            </tbody>
          </table> :
          <div><strong>None found.</strong></div>
        }

        { this.props.book && genreOptions && genreOptions.length > 0 &&
          <GenreForm
            genres={genreOptions}
            bookGenres={bookGenres}
            updateGenres={this.updateGenres}
            refresh={this.refresh}
            />
        }

        { this.props.classifications && this.props.classifications.length > 0 ?
          <Classifications classifications={this.props.classifications} /> :
          <div><strong>None found.</strong></div>
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchGenres();
      this.props.fetchClassifications(this.classificationsUrl());
    }
  }

  bookGenres() {
    if (!this.props.book || !this.props.book.categories || !this.props.genres) {
      return [];
    }

    let top = this.props.book.fiction ? "Fiction" : "Nonfiction";

    if (!this.props.genres[top]) {
      return [];
    }

    return this.props.book.categories.filter(category => {
      return !!this.props.genres[top][category];
    });
  }

  genreOptions() {
    if (!this.props.book || !this.props.genres) {
      return [];
    }

    let top = this.props.book.fiction ? "Fiction" : "Nonfiction";

    if (!this.props.genres[top]) {
      return [];
    }

    return Object.keys(this.props.genres[top]).map(key => this.props.genres[top][key]);
  }

  fullGenre(category) {
    let top = this.props.book.fiction ? "Fiction" : "Nonfiction";
    let genre = this.props.genres[top][category];
    return genre.parents.concat([genre.name]).join(" > ");
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
      this.updateGenres(genres).then(this.refresh);
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    genres: state.editor.genres.genres,
    classifications: state.editor.genres.classifications,
    isFetching: state.editor.genres.isFetching || state.editor.book.isFetching,
    fetchError: state.editor.genres.fetchError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url)),
    fetchGenres: () => dispatch(actions.fetchGenres()),
    fetchClassifications: (url: string) => dispatch(actions.fetchClassifications(url)),
    updateGenres: (url: string, data: FormData) => dispatch(actions.updateGenres(url, data))
  };
}

const ConnectedGenres = connect(
  mapStateToProps,
  mapDispatchToProps
)(Genres);

export default ConnectedGenres;
