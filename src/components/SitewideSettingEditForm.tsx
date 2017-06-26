import * as React from "react";
import EditableInput from "./EditableInput";
import { SitewideSettingsData, SitewideSettingData } from "../interfaces";

export interface SitewideSettingEditFormProps {
  data: SitewideSettingsData;
  item?: SitewideSettingData;
  csrfToken: string;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
}

export default class SitewideSettingEditForm extends React.Component<SitewideSettingEditFormProps, void> {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.availableSettings().length > 0 &&
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
              { this.availableSettings().map(setting =>
                  <option key={setting.key} value={setting.key}>{setting.label}</option>
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
        { this.availableSettings().length === 0 &&
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

  availableSettings() {
    const allSettings = this.props.data && this.props.data.all_settings || [];
    if (this.props.item) {
      for (const setting of allSettings) {
        if (setting.key === this.props.item.key) {
          return [setting];
        }
      }
    } else {
      const availableSettings = [];
      for (const possibleSetting of allSettings) {
        let hasSetting = false;
        for (const actualSetting of (this.props.data && this.props.data.settings) || []) {
          if (actualSetting.key === possibleSetting.key) {
            hasSetting = true;
          }
        }
        if (!hasSetting) {
          availableSettings.push(possibleSetting);
        }
      }
      return availableSettings;
    }
    return allSettings;
  }
}