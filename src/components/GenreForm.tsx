import * as React from "react";
import { GenreData } from "../interfaces";

export interface GenreFormProps {
  genreOptions: GenreData[];
  bookGenres: string[];
  addGenre: (genre: string) => void;
  disabled?: boolean;
}

export interface GenreFormState {
  genre: string | null;
  subgenre: string | null;
}

/** Form for selecting a genre to add to a book, used on the classifications tab
    of the book detail page. */
export default class GenreForm extends React.Component<GenreFormProps, GenreFormState> {
  constructor(props) {
    super(props);
    this.state = {
      genre: null,
      subgenre: null
    };
    this.handleGenreSelect = this.handleGenreSelect.bind(this);
    this.handleSubgenreSelect = this.handleSubgenreSelect.bind(this);
    this.addGenre = this.addGenre.bind(this);
  }

  render(): JSX.Element {
    let subgenres = null;
    if (this.state.genre) {
      let genre = this.props.genreOptions.find(genre => genre.name === this.state.genre);
      if (genre) {
        subgenres = genre.subgenres.sort();
      }
    }

    let disabledProps = this.props.disabled ? { disabled: true } : {};

    return (
      <div className="genre-form">
        <div className="form-inline">
          <select
            name="genre"
            size={this.topLevelGenres().length}
            className="form-control"
            {...disabledProps}>
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
              className="form-control subgenres"
              {...disabledProps}>
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
              onClick={this.addGenre}>
              Add
            </button>
          }
        </div>
      </div>
    );
  }

  topLevelGenres() {
    return this.props.genreOptions
      .filter(genre => genre.parents.length === 0);
  }

  bookHasGenre(genre) {
    return this.props.bookGenres.indexOf(genre) !== -1;
  }

  handleGenreSelect(event) {
    this.setState({ genre: event.target.value, subgenre: null });
  }

  handleSubgenreSelect(event) {
    this.setState({ genre: this.state.genre, subgenre: event.target.value });
  }

  resetForm() {
    this.setState({ genre: null, subgenre: null });
  }

  addGenre() {
    let newGenre = this.state.subgenre || this.state.genre;
    this.props.addGenre(newGenre);
    this.resetForm();
  }
}
