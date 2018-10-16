import * as React from "react";
import EditableInput from "./EditableInput";
import SaveButton from "./SaveButton";
import { SitewideSettingsData, SitewideSettingData } from "../interfaces";
import { handleSubmit } from "../sharedFunctions";

export interface SitewideSettingEditFormProps {
  data: SitewideSettingsData;
  item?: SitewideSettingData;
  disabled: boolean;
  save?: (data: FormData) => void;
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
    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
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
          <form ref="form" onSubmit={handleSubmit} className="edit-form">
            <EditableInput
              elementType="select"
              disabled={this.props.disabled}
              readOnly={!!(this.props.item && this.props.item.key)}
              name="key"
              ref="key"
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
                  ref="value"
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
                  ref="value"
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
            <SaveButton
              disabled={this.props.disabled}
              submit={this.submit}
              text="Submit"
              form={this.refs}
            />
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

  submit(event) {
    event.preventDefault();
    handleSubmit(this);
  }
}
