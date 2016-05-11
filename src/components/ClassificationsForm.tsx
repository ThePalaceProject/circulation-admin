import * as React from "react";
import * as ReactDOM from "react-dom";
import { EditableInput } from "./EditForm";
import GenreForm from "./GenreForm";
import { BookData, GenreTree } from "../interfaces";

export interface ClassificationsFormProps {
  book: BookData;
  bookGenres: string[];
  genres: GenreTree;
  disabled: boolean;
}

export default class ClassificationsForm extends React.Component<ClassificationsFormProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      audience: props.book ? props.book.audience : null,
      fiction: props.book ? props.book.fiction : null,
      genres: [],
      showGenreInput: false
    };
    this.addGenre = this.addGenre.bind(this);
    this.removeGenre = this.removeGenre.bind(this);
    this.toggleGenreInput = this.toggleGenreInput.bind(this);
  }

  render(): JSX.Element {
    let genreOptions = this.genreOptions();

    return (
      <div className="classificationsForm">
        <EditableInput
          type="select"
          disabled={this.props.disabled}
          name="audience"
          label="Audience"
          ref="audience"
          value={this.props.book.audience}
          onChange={this.handleAudienceChange.bind(this)}>
          <option value="Children">Children</option>
          <option value="Young Adult">Young Adult</option>
          <option value="Adult">Adult</option>
          <option value="Adults Only">Adults Only</option>
        </EditableInput>

        { (this.state.audience === "Children" || this.state.audience === "Young Adult") &&
          <div className="form-group">
            <label>Target Age Range</label>
            <div className="form-inline">
              <EditableInput
                type="text"
                label=""
                disabled={this.props.disabled}
                name="target_age_min"
                value={this.props.book.targetAgeRange[0]}
                style={{width: "50px"}}
                />
              <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
              <EditableInput
                type="text"
                label=""
                disabled={this.props.disabled}
                name="target_age_max"
                value={this.props.book.targetAgeRange[1]}
                style={{width: "50px"}}
                />
            </div>
          </div>
        }

        <div className="form-group">
          <label>Fiction Classification</label>
          <div className="form-inline">
            <EditableInput
              type="radio"
              disabled={this.props.disabled}
              name="fiction"
              label=" Fiction"
              value="fiction"
              ref="fiction"
              checked={this.state.fiction}
              onChange={this.handleFictionChange.bind(this)}
              />
            &nbsp; &nbsp; &nbsp;
            <EditableInput
              type="radio"
              disabled={this.props.disabled}
              name="fiction"
              label=" Nonfiction"
              value="nonfiction"
              ref="nonfiction"
              checked={!this.state.fiction}
              onChange={this.handleNonfictionChange.bind(this)}
              />
          </div>
        </div>

        <div className="form-group">
          <label>Genres</label>
          &nbsp;&nbsp;
          <a
            onClick={this.toggleGenreInput}
            style={{ cursor: "pointer" }}>
            add
          </a>

          { this.state.genres.map(category =>
            <div key={category}>
              {this.fullGenre(category)}
              &nbsp;
              <i
                className="fa fa-times"
                style={{ color: "#aaa" }}
                aria-hidden="true"
                onClick={() => this.removeGenre(category)}
                ></i>
            </div>
          ) }
        </div>

        { this.state.showGenreInput &&
          <div>
            <label>Add Genre</label>
            <GenreForm
              genreOptions={genreOptions}
              bookGenres={this.state.genres}
              addGenre={this.addGenre}
              />
          </div>
        }
      </div>
    );
  }

  componentWillReceiveProps(props) {
    if (props.book) {
      this.setState({ audience: props.book.audience });
      this.setState({ fiction: props.book.fiction });

      if (props.bookGenres) {
        this.setState({ genres: props.bookGenres });
      }
    }
  }

  genreOptions() {
    if (!this.props.book || !this.props.genres) {
      return [];
    }

    let top = this.state.fiction ? "Fiction" : "Nonfiction";

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

  handleAudienceChange() {
    let audience = (this.refs as any).audience;
    let value = (audience.refs as any).input.getValue();
    this.setState({ audience: value });
  }

  handleFictionChange() {
    let fiction = (this.refs as any).fiction;
    let value = (fiction.refs as any).input.getChecked();
    this.setState({ fiction: value });
  }

  handleNonfictionChange() {
    let nonfiction = (this.refs as any).nonfiction;
    let value = (nonfiction.refs as any).input.getChecked();
    this.setState({ fiction: !value });
  }

  addGenre(genre) {
    this.setState({ genres: this.state.genres.concat([genre]), showGenreInput: false });
  }

  removeGenre(genreToRemove) {
    this.setState({ genres: this.state.genres.filter(genre => genre !== genreToRemove) });
  }

  toggleGenreInput() {
    this.setState({ showGenreInput: !this.state.showGenreInput });
  }
}