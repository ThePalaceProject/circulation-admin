import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import SaveButton from "./SaveButton";
import { handleSubmit, findDefault } from "../sharedFunctions";
import { LibrariesData, LibraryData } from "../interfaces";

export interface LibraryEditFormProps {
  data: LibrariesData;
  item?: LibraryData;
  disabled: boolean;
  save: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
}

/** Form for editing a library's configuration, on the libraries tab of the
    system configuration page. */
export default class LibraryEditForm extends React.Component<LibraryEditFormProps, void> {
  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={handleSubmit} className="edit-form">
        <input
          type="hidden"
          name="uuid"
          value={this.props.item && this.props.item.uuid}
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="name"
          ref="name"
          label="Name"
          value={this.props.item && this.props.item.name}
          description="The human-readable name of this library."
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="short_name"
          ref="short_name"
          label="Short name"
          value={this.props.item && this.props.item.short_name}
          description="A short name of this library, to use when identifying it in scripts or URLs, e.g. 'NYPL'."
          />
        { this.props.data && this.props.data.settings && this.props.data.settings.map(setting =>
          <ProtocolFormField
            ref={setting.key}
            setting={setting}
            disabled={this.props.disabled}
            value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
            default={findDefault(setting)}
            />
          )
        }

        <SaveButton
          disabled={this.props.disabled}
          save={this.props.save}
          text="Submit"
          form={this.refs["form"]}
        />
      </form>
    );
  }
}
