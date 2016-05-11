import * as React from "react";
import { GenreData } from "../interfaces";

export interface GenreFormProps {
  genres: GenreData[];
  bookGenres: string[];
  updateGenres: (genres: string[]) => Promise<any>;
  refresh: () => void;
}

export default class GenreForm extends React.Component<GenreFormProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      errors: [],
      genre: null,
      subgenre: null
    };
    this.handleGenreSelect = this.handleGenreSelect.bind(this);
    this.handleSubgenreSelect = this.handleSubgenreSelect.bind(this);
    this.addGenre = this.addGenre.bind(this);
  }

  render(): JSX.Element {
    let subgenres =
      this.state.genre ?
      this.props.genres.find(genre => genre.name === this.state.genre).subgenres.sort() :
      null;

    return (
      <div className="genreForm">
        <h3>Add Genre</h3>
        { this.state.errors.map((error, i) =>
          <div className="genreFormError" key={i} style={{ color: "red", marginBottom: "5px" }}>{error}</div>
        ) }

        <div className="form-inline">
          <select name="genre" size={this.topLevelGenres().length} className="form-control" style={{ width: "200px" }}>
            { this.topLevelGenres().map(genre =>
              <option
                key={genre.name}
                value={genre.name}
                disabled={this.bookHasGenre(genre.name)}
                onClick={this.handleGenreSelect}>
                {genre.name + (genre.subgenres.length > 0 ? " >" : "")}
              </option>
            ) }
          </select>

          { subgenres && subgenres.length > 0 &&
            <select
              name="subgenre"
              size={subgenres.length}
              className="form-control"
              style={{ width: "200px", verticalAlign: "top", marginLeft: "10px" }}>
              { subgenres.map(genre =>
                <option
                  key={genre}
                  value={genre}
                  disabled={this.bookHasGenre(genre)}
                  onClick={this.handleSubgenreSelect}>
                  {genre}
                </option>
              ) }
            </select>
          }

          { this.state.genre &&
            <button
              className="btn btn-default"
              type="submit"
              style={{ verticalAlign: "top", marginLeft: "10px" }}
              onClick={this.addGenre}>
              Submit
            </button>
          }
        </div>
      </div>
    );
  }

  topLevelGenres() {
    return this.props.genres
      .filter(genre => genre.parents.length === 0);
  }

  bookHasGenre(genre) {
    return this.props.bookGenres.indexOf(genre) !== -1;
  }

  handleGenreSelect(event) {
    this.setState({ genre: event.target.value });
  }

  handleSubgenreSelect(event) {
    this.setState({ subgenre: event.target.value });
  }

  addGenre() {
    let newGenre = this.state.subgenre ? this.state.subgenre : this.state.genre;
    let genres = this.props.bookGenres.concat([newGenre]);
    return this.props.updateGenres(genres).then(response => {
      this.props.refresh();
      this.resetForm();
    }).catch(err => {
      this.showGenreError();
    });
  }

  showGenreError() {
    this.setState({ errors: ["Couldn't add genre."] });
  }

  resetForm() {
    this.setState({ genre: null, subgenre: null });
  }
}