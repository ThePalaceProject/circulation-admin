import * as React from "react";
import EditableInput from "./EditableInput";
import { LoggingSettingsData, LoggingSettingData } from "../interfaces";

export interface LoggingSettingEditFormProps {
  data: LoggingSettingsData;
  item?: LoggingSettingData;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
}

/** Form for editing a single logging setting. */
export default class LoggingSettingEditForm extends React.Component<LoggingSettingEditFormProps, any> {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      inputKey: this.availableSettings().length ? this.availableSettings()[0].key : "",
    };
  }

  render(): JSX.Element {
    return (
      <div>
        { this.availableSettings().length > 0 &&
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
                <option key="0" value="">None</option>
              { this.availableSettings().map(setting =>
                  <option key={setting.key} value={setting.key}>{setting.label}</option>
                )
              }
            </EditableInput>
            {
              this.state.inputKey && (
                this.state.inputKey !== "log_app" ? (
                  <EditableInput
                    elementType="select"
                    name="value"
                    label="value"
                    value={this.props.item && this.props.item.value}
                    >
                    { this.availableSettings().map(setting => {
                        if (setting.key === this.state.inputKey) {
                          return setting.options.map(s => {
                            return <option key={s.key} value={s.key}>{s.value}</option>;
                          });
                        }
                      })
                    }
                  </EditableInput>
                ) : (
                  <EditableInput
                    elementType="input"
                    type="text"
                    name="value"
                    label="value"
                    value={this.props.item && this.props.item.value}
                    />
                )
              )
            }
            {this.state.inputKey &&
              <button
                type="submit"
                className="btn btn-default"
                disabled={this.props.disabled}
                >Submit</button>
            }
          </form>
        }
        { this.availableSettings().length === 0 &&
          <p>All logging settings have already been created.</p>
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
        window.location.href = "/admin/web/config/loggingSettings/edit/" + data.get("key");
      }
    });
  }

  onChange(inputKey) {
    this.setState({ inputKey });
  }

  availableSettings() {
    const allSettings = this.props.data && this.props.data.all_settings || [];
    // console.log(allSettings);
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
