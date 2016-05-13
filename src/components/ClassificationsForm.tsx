import * as React from "react";
import * as ReactDOM from "react-dom";
import { EditableInput } from "./EditForm";
import GenreForm from "./GenreForm";
import { BookData, GenreTree } from "../interfaces";

export interface ClassificationsFormProps {
  book: BookData;
  genreTree: GenreTree;
  csrfToken: string;
  editClassifications: (data: FormData) => Promise<any>;
  disabled?: boolean;
}

export default class ClassificationsForm extends React.Component<ClassificationsFormProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      audience: props.book ? props.book.audience : null,
      fiction: props.book ? props.book.fiction : null,
      genres: []
    };
    this.handleAudienceChange = this.handleAudienceChange.bind(this);
    this.handleFictionChange = this.handleFictionChange.bind(this);
    this.addGenre = this.addGenre.bind(this);
    this.removeGenre = this.removeGenre.bind(this);
    this.submit = this.submit.bind(this);
  }

  render(): JSX.Element {
    let genreOptions = this.genreOptions();

    return (
      <div className="classificationsForm">
        <EditableInput
          type="select"
          disabled={this.props.disabled}
          style={{ width: 200 }}
          name="audience"
          label="Audience"
          ref="audience"
          value={this.props.book.audience}
          onChange={this.handleAudienceChange}>
          <option value="Children">Children</option>
          <option value="Young Adult">Young Adult</option>
          <option value="Adult">Adult</option>
          <option value="Adults Only">Adults Only</option>
        </EditableInput>

        { this.shouldShowTargetAge() &&
          <div className="form-group">
            <label>Target Age Range</label>
            <div className="form-inline">
              <EditableInput
                ref="targetAgeMin"
                type="text"
                label=""
                disabled={this.props.disabled}
                name="target_age_min"
                value={this.props.book.targetAgeRange[0]}
                style={{width: "50px"}}
                />
              <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
              <EditableInput
                ref="targetAgeMax"
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
              onChange={this.handleFictionChange}
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
              onChange={this.handleFictionChange}
              />
          </div>
        </div>

        <div className="form-group">
          <label>Genres</label>
          { this.state.genres.sort().map(category =>
            <div key={category} className="bookGenre">
              <div className="bookGenreName" style={{ display: "inline-block", marginRight: 10 }}>
                {this.fullGenre(category)}
              </div>
              <i
                className="fa fa-times removeBookGenre"
                style={{ color: "#aaa" }}
                aria-hidden="true"
                onClick={() => !this.props.disabled && this.removeGenre(category)}
                ></i>
              <a
                className="sr-only"
                onClick={() => !this.props.disabled && this.removeGenre(category)}
                >remove</a>
            </div>
          ) }
        </div>

        <div>
          <label>Add Genre</label>
          <GenreForm
            disabled={this.props.disabled}
            genreOptions={genreOptions}
            bookGenres={this.state.genres}
            addGenre={this.addGenre}
            />
        </div>

        <br />

        <button
          className="btn btn-default"
          onClick={this.submit}>Save</button>
      </div>
    );
  }

  componentWillMount() {
    if (this.props.book) {
      this.setState({ audience: this.props.book.audience });
      this.setState({ fiction: this.props.book.fiction });
      this.setState({ genres: this.bookGenres() });
    }
  }

  bookGenres() {
    if (!this.props.book || !this.props.book.categories || !this.props.genreTree) {
      return [];
    }

    return this.props.book.categories.filter(category => {
      return !!this.props.genreTree["Fiction"][category] ||
        !!this.props.genreTree["Nonfiction"][category];
    });
  }

  shouldShowTargetAge() {
    return this.state.audience === "Children" || this.state.audience === "Young Adult";
  }

  filterGenres(genres: string[], fiction: boolean = true) {
    let top = fiction ? "Fiction" : "Nonfiction";

    if (!this.props.genreTree[top]) {
      return [];
    }

    return genres.filter(genre => this.props.genreTree[top][genre]);
  }

  genreOptions() {
    if (!this.props.book || !this.props.genreTree) {
      return [];
    }

    let top = this.state.fiction ? "Fiction" : "Nonfiction";

    if (!this.props.genreTree[top]) {
      return [];
    }

    return Object.keys(this.props.genreTree[top]).map(key => this.props.genreTree[top][key]);
  }

  fullGenre(category) {
    let top = this.state.fiction ? "Fiction" : "Nonfiction";
    let genre = this.props.genreTree[top][category];
    return genre.parents.concat([genre.name]).join(" > ");
  }

  validateAudience(audience, genres) {
    // fails if genres include Erotica but audience isn't Adults Only
    if (genres.indexOf("Erotica") !== -1 && audience !== "Adults Only") {
      alert("Erotica genre requires Adults Only audience");
      return false;
    } else {
      return true;
    }
  }

  handleAudienceChange() {
    let audience = (this.refs as any).audience;
    let value = (audience.refs as any).input.getValue();

    if (this.validateAudience(value, this.state.genres)) {
      this.setState({ audience: value });
    } else {
      return false;
    };
  }

  handleFictionChange() {
    let fiction = (this.refs as any).fiction;
    let value = (fiction.refs as any).input.getChecked();
    let clearedType = fiction ? "Nonfiction" : "Fiction";

    if (this.state.genres.length === 0 || confirm(`Are you sure? This will clear any ${clearedType} genres you have chosen!`)) {
      this.setState({ fiction: value, genres: this.filterGenres(this.state.genres, value) });
    }
  }

  addGenre(genre) {
    if (this.validateAudience(this.state.audience, [genre])) {
      this.setState({ genres: this.state.genres.concat([genre]) });
    };
  }

  removeGenre(genreToRemove) {
    this.setState({ genres: this.state.genres.filter(genre => genre !== genreToRemove) });
  }

  submit() {
    let data = new FormData();
    data.append("csrf_token", this.props.csrfToken);
    data.append("audience", this.state.audience);
    if (this.shouldShowTargetAge()) {
      data.append("target_age_min", (this.refs as any).targetAgeMin.getValue());
      data.append("target_age_max", (this.refs as any).targetAgeMax.getValue());
    }
    data.append("fiction", this.state.fiction ? "fiction" : "nonfiction");
    this.state.genres.forEach(genre => data.append("genres", genre));
    return this.props.editClassifications(data);
  }
}