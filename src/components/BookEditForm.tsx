import * as React from "react";
import EditableInput from "./EditableInput";
import { Button, Form } from "library-simplified-reusable-components";
import { BookData, ContributorData, RolesData, MediaData, LanguagesData } from "../interfaces";
import WithRemoveButton from "./WithRemoveButton";
import LanguageField from "./LanguageField";

export interface BookEditFormProps extends BookData {
  roles: RolesData;
  media: MediaData;
  languages: LanguagesData;
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

  render(): JSX.Element {
    return (
      <Form
        onSubmit={this.save.bind(this)}
        className="no-border edit-form"
        content={this.renderForm()}
        disableButton={this.props.disabled}
      />
    );
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
            <Button
              type="button"
              className="add-contributor"
              disabled={this.props.disabled}
              callback={this.addContributor}
              content="Add"
            />
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
        <LanguageField
          disabled={this.props.disabled}
          languages={this.props.languages}
          name="language"
          label="Language"
          value={this.props.language}
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

  save(data) {
    this.props.editBook(this.props.editLink.href, data).then(response => {
      this.props.refresh();
    });
  }
};
