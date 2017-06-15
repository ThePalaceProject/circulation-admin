import * as React from "react";
import EditableInput from "./EditableInput";
import { SitewideSettingsData, SitewideSettingData } from "../interfaces";

export interface SitewideSettingEditFormProps {
  data: SitewideSettingsData;
  item?: SitewideSettingData;
  csrfToken: string;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
}

export default class SitewideSettingEditForm extends React.Component<SitewideSettingEditFormProps, void> {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.availableFields().length > 0 &&
          <form ref="form" onSubmit={this.save} className="edit-form">
            <input
              type="hidden"
              name="csrf_token"
              value={this.props.csrfToken}
              />
            <EditableInput
              elementType="select"
              disabled={this.props.disabled}
              readOnly={!!(this.props.item && this.props.item.key)}
              name="key"
              label="key"
              value={this.props.item && this.props.item.key}
              >
              { this.availableFields().map(field =>
                  <option key={field.key} value={field.key}>{field.label}</option>
                )
              }
            </EditableInput>
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name="value"
              label="Value"
              value={this.props.item && this.props.item.value}
              />
            <button
              type="submit"
              className="btn btn-default"
              disabled={this.props.disabled}
              >Submit</button>
          </form>
        }
        { this.availableFields().length === 0 &&
          <p>All sitewide settings have already been created.</p>
        }
      </div>
    );
  }

  save(event) {
    event.preventDefault();
    const data = new (window as any).FormData(this.refs["form"] as any);
    this.props.editItem(data).then(() => {
      // If a new setting was created, go to its edit page.
      if (!this.props.item && data.get("key")) {
        window.location.href = "/admin/web/config/sitewideSettings/edit/" + data.get("key");
      }
    });
  }

  availableFields() {
    const fields = this.props.data && this.props.data.fields || [];
    if (this.props.item) {
      for (const field of fields) {
        if (field.key === this.props.item.key) {
          return [field];
        }
      }
    } else {
      const availableFields = [];
      for (const field of fields) {
        let hasSetting = false;
        for (const setting of (this.props.data && this.props.data.settings) || []) {
          if (setting.key === field.key) {
            hasSetting = true;
          }
        }
        if (!hasSetting) {
          availableFields.push(field);
        }
      }
      return availableFields;
    }
    return fields;
  }
}