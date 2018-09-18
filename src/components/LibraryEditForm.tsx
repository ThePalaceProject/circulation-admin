import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { LibrariesData, LibraryData } from "../interfaces";

export interface LibraryEditFormProps {
  data: LibrariesData;
  item?: LibraryData;
  disabled: boolean;
  goToEdit: (responseBody: string) => void;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
}

/** Form for editing a library's configuration, on the libraries tab of the
    system configuration page. */
export default class LibraryEditForm extends React.Component<LibraryEditFormProps, void> {
  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.save.bind(this)} className="edit-form">
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
          label="Name"
          value={this.props.item && this.props.item.name}
          description="The human-readable name of this library."
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="short_name"
          label="Short name"
          value={this.props.item && this.props.item.short_name}
          description="A short name of this library, to use when identifying it in scripts or URLs, e.g. 'NYPL'."
          />
        { this.props.data && this.props.data.settings && this.props.data.settings.map(setting =>
          <ProtocolFormField
            setting={setting}
            disabled={this.props.disabled}
            value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
            />
          )
        }
        <button
          className="btn btn-default"
          disabled={this.props.disabled}
          type="submit">
          Submit
        </button>
      </form>
    );
  }

  save(event) {
    event.preventDefault();
    const data = new (window as any).FormData(this.refs["form"] as any);
    this.props.editItem(data).then(() => {
      // Scrolling to the top lets the user see the success message
      window.scrollTo(0, 0);
      // If a new library was created, go to the new library's edit page.
      if (!this.props.item && this.props.responseBody) {
        setTimeout(() => {this.props.goToEdit(this.props.responseBody)}, 2000);
      }
    });
  }
}
