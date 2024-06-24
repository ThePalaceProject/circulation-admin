import * as React from "react";
import * as ReactDOM from "react-dom";
import EditableInput from "./EditableInput";
import WithRemoveButton from "./WithRemoveButton";
import GenreForm from "./GenreForm";
import { BookData, GenreTree } from "../interfaces";
import { Button, Panel } from "library-simplified-reusable-components";
import { Alert } from "react-bootstrap";

export interface ClassificationsFormProps {
  book: BookData;
  genreTree: GenreTree;
  editClassifications: (data: FormData) => Promise<any>;
  disabled?: boolean;
}

/** Form for editing a books classifications on the classifications tab of the
    book detail page. */
export default class ClassificationsForm extends React.Component<
  ClassificationsFormProps,
  any
> {
  private errorMessageRef = React.createRef<Alert>();
  private audienceRef = React.createRef<EditableInput>();
  private targetAgeMinRef = React.createRef<EditableInput>();
  private targetAgeMaxRef = React.createRef<EditableInput>();
  private noFictionSelectedRef = React.createRef<EditableInput>();
  private fictionRef = React.createRef<EditableInput>();
  private nonfictionRef = React.createRef<EditableInput>();
  constructor(props) {
    super(props);
    this.state = {
      audience:
        props.book && props.book.audience ? props.book.audience : "None",
      fiction: props.book ? props.book.fiction : undefined,
      genres: [],
      error: null,
    };
    this.handleAudienceChange = this.handleAudienceChange.bind(this);
    this.handleFictionChange = this.handleFictionChange.bind(this);
    this.addGenre = this.addGenre.bind(this);
    this.removeGenre = this.removeGenre.bind(this);
    this.submit = this.submit.bind(this);
  }

  render(): JSX.Element {
    const { audience, fiction, error, genres } = this.state;
    const genreOptions = this.genreOptions();
    const hasAudienceError =
      audience === "None" || (error && error["audience"]);
    const hasFictionError =
      fiction === undefined || (error && error["fiction"]);

    return (
      <fieldset className="classifications-form">
        <legend className="visuallyHidden">Classifications</legend>

        {error && (
          <Alert bsStyle="danger" ref={this.errorMessageRef} tabIndex={-1}>
            {Object.keys(error).map((err) => {
              return <p key={err}>{error[err]}</p>;
            })}
          </Alert>
        )}

        <Panel
          id="classifications"
          headerText="Classifications"
          collapsible={false}
          onEnter={this.submit}
          content={
            <div>
              <EditableInput
                elementType="select"
                disabled={this.props.disabled}
                name="audience"
                label="Audience"
                ref={this.audienceRef}
                value={this.props.book.audience || "None"}
                onChange={this.handleAudienceChange}
                clientError={hasAudienceError}
              >
                {(!audience || audience === "None") && (
                  <option value="None" aria-selected={audience === "None"}>
                    None
                  </option>
                )}
                <option
                  value="Children"
                  aria-selected={audience === "Children"}
                >
                  Children
                </option>
                <option
                  value="Young Adult"
                  aria-selected={audience === "Young Adult"}
                >
                  Young Adult
                </option>
                <option value="Adult" aria-selected={audience === "Adult"}>
                  Adult
                </option>
                <option
                  value="Adults Only"
                  aria-selected={audience === "Adults Only"}
                >
                  Adults Only
                </option>
                <option
                  value="All Ages"
                  aria-selected={audience === "All Ages"}
                >
                  All Ages
                </option>
                <option
                  value="Research"
                  aria-selected={audience === "Research"}
                >
                  Research
                </option>
              </EditableInput>

              {this.shouldShowTargetAge() && (
                <div className="form-group target-age">
                  <p>Target Age Range</p>
                  <div className="form-inline">
                    <EditableInput
                      elementType="input"
                      ref={this.targetAgeMinRef}
                      type="text"
                      disabled={this.props.disabled}
                      name="target_age_min"
                      aria-label="Enter a minimum target age"
                      value={this.props.book.targetAgeRange[0]}
                    />
                    <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
                    <EditableInput
                      elementType="input"
                      ref={this.targetAgeMaxRef}
                      type="text"
                      disabled={this.props.disabled}
                      name="target_age_max"
                      aria-label="Enter a maximum target age"
                      value={this.props.book.targetAgeRange[1]}
                    />
                  </div>
                </div>
              )}
              <div className="form-group fiction-radio-input">
                <p>Fiction Classification</p>
                <div className="form-inline">
                  {fiction === undefined && (
                    <EditableInput
                      type="radio"
                      disabled={this.props.disabled}
                      name="fiction"
                      value="none"
                      label="None"
                      ref={this.noFictionSelectedRef}
                      checked={true}
                      onChange={this.handleFictionChange}
                      clientError={hasFictionError}
                    />
                  )}
                  <EditableInput
                    type="radio"
                    disabled={this.props.disabled}
                    name="fiction"
                    value="fiction"
                    label="Fiction"
                    ref={this.fictionRef}
                    checked={fiction !== undefined && fiction}
                    onChange={this.handleFictionChange}
                    clientError={hasFictionError}
                  />
                  <EditableInput
                    type="radio"
                    disabled={this.props.disabled}
                    name="fiction"
                    value="nonfiction"
                    label="Nonfiction"
                    ref={this.nonfictionRef}
                    checked={fiction !== undefined && !fiction}
                    onChange={this.handleFictionChange}
                    clientError={hasFictionError}
                  />
                </div>
              </div>
              <div className="form-group genre-group-form">
                <p>Genres</p>
                {genres.sort().map((category) => (
                  <WithRemoveButton
                    key={category}
                    disabled={this.props.disabled}
                    onRemove={() => this.removeGenre(category)}
                  >
                    {this.fullGenre(category)}
                  </WithRemoveButton>
                ))}

                <p className="add-genre-form-title">Add Genre</p>
                <GenreForm
                  disabled={this.props.disabled}
                  genreOptions={genreOptions}
                  bookGenres={genres}
                  addGenre={this.addGenre}
                />
              </div>
            </div>
          }
        />
        <Button className="left-align" callback={this.submit} content="Save" />
      </fieldset>
    );
  }

  UNSAFE_componentWillMount() {
    if (this.props.book) {
      this.setState({ audience: this.props.book.audience || "None" });
      this.setState({ fiction: this.props.book.fiction });
      this.setState({ genres: this.bookGenres(this.props.book) });
    }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.bookChanged(newProps.book)) {
      this.setState({ audience: newProps.book.audience });
      this.setState({ fiction: newProps.book.fiction });
      this.setState({ genres: this.bookGenres(newProps.book) });
    }
  }

  bookChanged(newBook: BookData): boolean {
    return (
      newBook.audience !== this.props.book.audience ||
      newBook.targetAgeRange[0] !== this.props.book.targetAgeRange[0] ||
      newBook.targetAgeRange[1] !== this.props.book.targetAgeRange[1] ||
      newBook.fiction !== this.props.book.fiction ||
      new Set(newBook.categories) !== new Set(this.props.book.categories)
    );
  }

  bookGenres(book: BookData) {
    if (!book || !book.categories || !this.props.genreTree) {
      return [];
    }

    return book.categories.filter((category) => {
      return (
        !!this.props.genreTree["Fiction"][category] ||
        !!this.props.genreTree["Nonfiction"][category]
      );
    });
  }

  shouldShowTargetAge() {
    return (
      this.state.audience === "Children" ||
      this.state.audience === "Young Adult"
    );
  }

  filterGenres(genres: string[], fiction = true) {
    const top = fiction ? "Fiction" : "Nonfiction";

    if (!this.props.genreTree[top]) {
      return [];
    }

    return genres.filter((genre) => this.props.genreTree[top][genre]);
  }

  genreOptions() {
    if (!this.props.book || !this.props.genreTree) {
      return [];
    }

    const top = this.state.fiction ? "Fiction" : "Nonfiction";

    if (!this.props.genreTree[top]) {
      return [];
    }

    return Object.keys(this.props.genreTree[top]).map(
      (key) => this.props.genreTree[top][key]
    );
  }

  fullGenre(category) {
    for (const top of ["Fiction", "Nonfiction"]) {
      const genre = this.props.genreTree[top][category];
      if (genre) {
        return genre.parents.concat([genre.name]).join(" > ");
      }
    }

    return category;
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
    const value = this.audienceRef.current.getValue();
    if (this.validateAudience(value, this.state.genres)) {
      this.setState({ audience: value });
    } else {
      return false;
    }
  }

  handleFictionChange() {
    const value = this.fictionRef.current.getChecked();
    const clearedType = value ? "Nonfiction" : "Fiction";
    const message =
      "Are you sure? This will clear any " +
      clearedType +
      " genres you have chosen!";

    if (this.state.genres.length === 0 || window.confirm(message)) {
      this.setState({
        fiction: value,
        genres: this.filterGenres(this.state.genres, value),
      });
    }
  }

  addGenre(genre) {
    if (this.validateAudience(this.state.audience, [genre])) {
      this.setState({ genres: this.state.genres.concat([genre]) });
    }
  }

  removeGenre(genreToRemove) {
    this.setState({
      genres: this.state.genres.filter((genre) => genre !== genreToRemove),
    });
  }

  submit() {
    const { audience, fiction } = this.state;
    const data = new (window as any).FormData();
    const error = {};
    if (!audience || audience === "None") {
      error["audience"] = "No Audience classification selected.";
    }
    if (fiction === undefined) {
      error["fiction"] = "No Fiction classification selected.";
    }
    if (error["audience"] || error["fiction"]) {
      this.setState({ error });
      setTimeout(() => {
        if (this.errorMessageRef.current) {
          const element = ReactDOM.findDOMNode(
            this.errorMessageRef.current
          ) as HTMLElement;
          element.focus();
        }
      }, 500);
      return;
    }

    data.append("audience", audience);
    if (this.shouldShowTargetAge()) {
      data.append("target_age_min", this.targetAgeMinRef.current.getValue());
      data.append("target_age_max", this.targetAgeMaxRef.current.getValue());
    }
    data.append("fiction", fiction ? "fiction" : "nonfiction");
    this.state.genres.forEach((genre) => data.append("genres", genre));
    this.setState({ error: null });
    return this.props.editClassifications(data);
  }
}
