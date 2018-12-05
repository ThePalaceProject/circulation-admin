import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import SaveButton from "./SaveButton";
import { handleSubmit, findDefault, clearForm } from "./sharedFunctions";
import { LibrariesData, LibraryData } from "../interfaces";
import Collapsible from "./Collapsible";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface LibraryEditFormProps {
  data: LibrariesData;
  item?: LibraryData;
  disabled: boolean;
  save: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
  error?: FetchErrorData;
}

/** Form for editing a library's configuration, on the libraries tab of the
    system configuration page. */
export default class LibraryEditForm extends React.Component<LibraryEditFormProps, void> {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  separateCategories(nonRequiredFields) {
    let categories = {};
    nonRequiredFields.forEach((setting) => {
      categories[setting.category] = categories[setting.category] ? categories[setting.category].concat(setting) : [setting];
    });
    return categories;
  }

  renderForms(categories) {
    let forms = [];
    let categoryNames = Object.keys(categories);
    categoryNames.forEach((name) => {
      let form = (
        <Collapsible
          title={`${name} (Optional)`}
          body={this.renderFieldset(categories[name])}
        />
      );
      forms.push(form);
    });
    return forms;
  }

  renderFieldset(fields) {
    return (
      <fieldset>
        <legend className="visuallyHidden">Additional Fields</legend>
        { fields.map(setting =>
          <ProtocolFormField
            key={setting.key}
            ref={setting.key}
            setting={setting}
            disabled={this.props.disabled}
            value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
            default={findDefault(setting)}
            error={this.props.error}
            />
          )
        }
      </fieldset>
    );
  }

  render(): JSX.Element {
    let requiredFields = [];
    let nonRequiredFields = [];

    if (this.props.data && this.props.data.settings) {
      nonRequiredFields = this.props.data.settings.filter(setting => !setting.required);
      requiredFields = this.props.data.settings.filter(setting => setting.required);
    }

    let categories = this.separateCategories(nonRequiredFields);

    return (
      <form ref="form" onSubmit={this.submit} className="edit-form">
        <input
          type="hidden"
          name="uuid"
          value={this.props.item && this.props.item.uuid}
          />
        <Collapsible
          title="Required Fields"
          openByDefault={true}
          body={
            <fieldset>
              <legend className="visuallyHidden">Required Fields</legend>
              <EditableInput
                elementType="input"
                type="text"
                disabled={this.props.disabled}
                required={true}
                name="name"
                ref="name"
                label="Name"
                value={this.props.item && this.props.item.name}
                description="The human-readable name of this library."
                error={this.props.error}
                />
              <EditableInput
                elementType="input"
                type="text"
                disabled={this.props.disabled}
                required={true}
                name="short_name"
                ref="short_name"
                label="Short name"
                value={this.props.item && this.props.item.short_name}
                description="A short name of this library, to use when identifying it in scripts or URLs, e.g. 'NYPL'."
                error={this.props.error}
                />
              { requiredFields.map(setting =>
                <ProtocolFormField
                  key={setting.key}
                  ref={setting.key}
                  setting={setting}
                  disabled={this.props.disabled}
                  value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
                  default={findDefault(setting)}
                  error={this.props.error}
                  />
                )
              }
            </fieldset>
          }
        />

        { this.renderForms(categories) }

        <SaveButton
          disabled={this.props.disabled}
          submit={this.submit}
          text="Submit"
          form={this.refs}
        />
      </form>
    );
  }

  submit(event) {
    event.preventDefault();
    handleSubmit(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.responseBody && !nextProps.fetchError) {
      clearForm(this.refs);
    }
  }

}
