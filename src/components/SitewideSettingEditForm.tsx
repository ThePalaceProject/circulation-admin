import * as React from "react";
import EditableInput from "./EditableInput";
import { SitewideSettingsData, SitewideSettingData } from "../interfaces";

export interface SitewideSettingEditFormProps {
  data: SitewideSettingsData;
  item?: SitewideSettingData;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
}

export interface SitewideSettingEditFormState {
  inputKey: string;
}

/** Form for editing a single sitewide setting. */
export default class SitewideSettingEditForm extends React.Component<SitewideSettingEditFormProps, SitewideSettingEditFormState> {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      inputKey: this.availableSettings().length ? this.availableSettings()[0].key : "",
    };
  }

  render(): JSX.Element {
    const inputKey = this.state.inputKey;
    const availableSettings = this.availableSettings();
    let settingToRender;
    availableSettings.forEach(setting => {
      if (setting.key === inputKey) {
        settingToRender = setting;
      }
    });
    const selectType = !!(settingToRender && settingToRender.options && settingToRender.options.length);
    return (
      <div>
        { availableSettings.length > 0 &&
          <form ref="form" onSubmit={this.save} className="edit-form">
            <EditableInput
              elementType="select"
              disabled={this.props.disabled}
              readOnly={!!(this.props.item && this.props.item.key)}
              name="key"
              label="key"
              value={this.props.item && this.props.item.key}
              onChange={this.onChange}
            >
              {
                availableSettings.map(setting =>
                  <option key={setting.key} value={setting.key}>{setting.label}</option>
                )
              }
            </EditableInput>
            {
              selectType ? (
                <EditableInput
                  elementType="select"
                  name="value"
                  label="Value"
                  value={this.props.item && this.props.item.value}
                >
                  {
                    availableSettings.map(setting => {
                      if (setting.key === inputKey) {
                        return setting.options.map(s => {
                          return <option key={s.key} value={s.key}>{s.label}</option>;
                        });
                      }
                    })
                  }
                </EditableInput>
              ) : (
                <EditableInput
                  elementType="input"
                  type="text"
                  disabled={this.props.disabled}
                  name="value"
                  label="Value"
                  value={this.props.item && this.props.item.value}
                />
              )
            }
            {
              availableSettings.map(setting => {
                if (setting.key === inputKey && setting.description) {
                  return <p className="description" dangerouslySetInnerHTML={{__html: setting.description}} />;
                }
              })
            }
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

  onChange(inputKey) {
    this.setState({ inputKey });
  }

  save(event) {
    event.preventDefault();
    const data = new (window as any).FormData(this.refs["form"] as any);
    this.props.editItem(data).then(() => {
      // If a new setting was created, go to its edit page.
      if (!this.props.item && data.get("key")) {
        setTimeout(() => { this.props.goToEdit(data.get("key")); }, 2000);
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
