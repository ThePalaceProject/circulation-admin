import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import SaveButton from "./SaveButton";
import { handleSubmit, findDefault, clearForm } from "./sharedFunctions";
import { LibrariesData, LibraryData } from "../interfaces";
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

  render(): JSX.Element {
    let requiredFields = [];
    let nonRequiredFields = [];
    if (this.props.data && this.props.data.settings) {
      nonRequiredFields = this.props.data.settings.filter(setting => !setting.required);
      requiredFields = this.props.data.settings.filter(setting => setting.required);
    }
    return (
      <form ref="form" onSubmit={this.submit} className="edit-form">
        <input
          type="hidden"
          name="uuid"
          value={this.props.item && this.props.item.uuid}
          />
        <fieldset>
          <legend><h4>Required Fields</h4></legend>
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
        <fieldset>
          <legend><h4>Additional Fields</h4></legend>
          { nonRequiredFields.map(setting =>
            <ProtocolFormField
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
