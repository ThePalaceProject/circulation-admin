import * as React from "react";
import EditableInput from "./EditableInput";
import { BookData, ContributorData, RolesData, MediaData, LanguagesData } from "../interfaces";
import WithRemoveButton from "./WithRemoveButton";
import Autocomplete from "./Autocomplete";

export interface BookEditFormProps extends BookData {
  roles: RolesData;
  languages: LanguagesData;
  media: MediaData;
  disabled: boolean;
  refresh: () => any;
  editBook: (url: string, data: FormData) => Promise<any>;
}

export interface BookEditFormState {
  contributors?: ContributorData[];
}

/** Edit a book's metadata in the edit tab on the book details page. */
export default class BookEditForm extends React.Component<BookEditFormProps, BookEditFormState> {
  constructor(props) {
    super(props);
    this.state = {
      contributors: (props.authors || []).concat(props.contributors || [])
    };
    this.addContributor = this.addContributor.bind(this);
    this.removeContributor = this.removeContributor.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  renderForm() {
    return (
      <fieldset>
        <legend className="visuallyHidden">Edit Book Metadata</legend>
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="title"
          label="Title"
          value={this.props.title}
          optionalText={false}
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="subtitle"
          label="Subtitle"
          value={this.props.subtitle}
          optionalText={false}
          />
        <div className="form-group">
          <label>Authors and Contributors</label>
          { this.state.contributors.map(contributor =>
              <WithRemoveButton
                key={contributor.name + contributor.role}
                disabled={this.props.disabled}
                onRemove={() => this.removeContributor(contributor)}
                >
                <span className="contributor-form">
                  <EditableInput
                    elementType="select"
                    disabled={this.props.disabled}
                    name="contributor-role"
                    value={this.getContributorRole(contributor)}
                    >
                    { this.props.roles && Object.values(this.props.roles).map(role =>
                        <option value={role} key={role}>{role}</option>
                      )
                    }
                  </EditableInput>
                  <EditableInput
                    elementType="input"
                    type="text"
                    disabled={this.props.disabled}
                    name="contributor-name"
                    value={contributor.name}
                    optionalText={false}
                    />
                </span>
              </WithRemoveButton>
            )
          }
          <span className="contributor-form">
            <EditableInput
              elementType="select"
              disabled={this.props.disabled}
              name="contributor-role"
              value="Author"
              ref="addContributorRole"
              >
              { this.props.roles && Object.values(this.props.roles).map(role =>
                  <option value={role} key={role}>{role}</option>
                )
              }
            </EditableInput>
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name="contributor-name"
              ref="addContributorName"
              optionalText={false}
              />
            <button
              type="button"
              className="btn btn-default add-contributor"
              disabled={this.props.disabled}
              onClick={this.addContributor}
              >Add</button>
          </span>
        </div>
        <div className="form-group">
          <label>Series</label>
          <div className="form-inline">
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name="series"
              placeholder="Name"
              value={this.props.series}
              optionalText={false}
              />
            <span>&nbsp;&nbsp;</span>
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name="series_position"
              placeholder="#"
              value={this.props.seriesPosition !== undefined && this.props.seriesPosition !== null && String(this.props.seriesPosition)}
              optionalText={false}
              />
          </div>
        </div>
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          name="medium"
          label="Medium"
          value={this.getMedium(this.props.medium)}
          >
          { this.props.media && Object.values(this.props.media).map(medium =>
              <option value={medium} key={medium}>{medium}</option>
            )
          }
        </EditableInput>
        <Autocomplete
          autocompleteValues={this.uniqueLanguageNames()}
          disabled={this.props.disabled}
          name="language"
          label="Language"
          value={this.props.languages && this.props.languages[this.props.language] && this.props.languages[this.props.language][0]}
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="publisher"
          label="Publisher"
          value={this.props.publisher}
          optionalText={false}
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="imprint"
          label="Imprint"
          value={this.props.imprint}
          optionalText={false}
          />
        <EditableInput
          elementType="input"
          type="date"
          disabled={this.props.disabled}
          name="issued"
          label="Publication Date"
          value={this.props.issued}
          optionalText={false}
          />
        <EditableInput
          elementType="input"
          type="number"
          disabled={this.props.disabled}
          name="rating"
          label="Rating (1-5, higher is better)"
          min={1}
          max={5}
          value={this.props.rating && String(Math.round(this.props.rating))}
          optionalText={false}
          />
        <EditableInput
          elementType="textarea"
          disabled={this.props.disabled}
          name="summary"
          label="Summary"
          value={this.props.summary}
          optionalText={false}
          />
      </fieldset>
    );
  }

  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.save.bind(this)} className="edit-form">
        {this.renderForm()}
        <button
          className="btn btn-default"
          disabled={this.props.disabled}
          type="submit">
          Submit
        </button>
      </form>
    );
  }

  uniqueLanguageNames() {
    const languageNames = [];
    for (let nameList of Object.values(this.props.languages || {})) {
      for (let name of nameList) {
        if (languageNames.indexOf(name) === -1) {
          languageNames.push(name);
        }
      }
    }
    return languageNames;
  }

  getMedium(additionalTypeOrMedium) {
    if (this.props.media) {
      if (this.props.media[additionalTypeOrMedium]) {
        return this.props.media[additionalTypeOrMedium];
      }
    }
    return additionalTypeOrMedium;
  }

  getContributorRole(contributor) {
    if (this.props.roles) {
      if (this.props.roles[contributor.role]) {
        return this.props.roles[contributor.role];
      }
    }
    return contributor.role;
  }

  removeContributor(contributor) {
    const remainingContributors = this.state.contributors.filter(stateContributor => {
      return !(stateContributor.name === contributor.name && stateContributor.role === contributor.role);
    });
    this.setState({ contributors: remainingContributors });
  }

  addContributor() {
    const name = (this.refs["addContributorName"] as any).getValue();
    const role = (this.refs["addContributorRole"] as any).getValue();
    this.setState({ contributors: this.state.contributors.concat({ role, name }) });
    (this.refs["addContributorName"] as any).clear();
    (this.refs["addContributorRole"] as any).clear();
  }

  save(event) {
    event.preventDefault();

    let data = new (window as any).FormData(this.refs["form"] as any);
    this.props.editBook(this.props.editLink.href, data).then(response => {
      this.props.refresh();
    });
  }
};
