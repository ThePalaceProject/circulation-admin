import * as React from "react";
import EditableInput from "./EditableInput";
import WithRemoveButton from "./WithRemoveButton";
import ColorPicker from "./ColorPicker";
import { SettingData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface ProtocolFormFieldProps {
  setting: SettingData;
  disabled: boolean;
  value?: string | string[];
  default?: any;
  error?: FetchErrorData;
}

export interface ProtocolFormFieldState {
  listItems?: string [];
}

/** Shows a form field for editing a single setting, based on setting information
    from the server. */
export default class ProtocolFormField extends React.Component<ProtocolFormFieldProps, ProtocolFormFieldState> {
  constructor(props) {
    super(props);
    this.state = {
      listItems: (props.value as string[]) || []
    };
    this.addListItem = this.addListItem.bind(this);
    this.removeListItem = this.removeListItem.bind(this);
    this.randomize = this.randomize.bind(this);
    this.isDefault = this.isDefault.bind(this);
    this.shouldBeChecked = this.shouldBeChecked.bind(this);
  }

  isDefault(option) {
    if (this.props.default) {
      return this.props.default.indexOf(option) >= 0 || this.props.default.indexOf(option.key) >= 0;
    }
  }

  shouldBeChecked(option) {
    let isValue = (this.props.value && (this.props.value.indexOf(option.key) !== -1));
    let isDefault = (!this.props.value && this.isDefault(option));
    return isValue || isDefault;
  }

  render(): JSX.Element {
    const setting = this.props.setting;
    if (setting.type === "text" || setting.type === undefined) {
      return (
        <div className={setting.randomizable ? "randomizable" : ""}>
          <EditableInput
            elementType="input"
            type="text"
            disabled={this.props.disabled}
            name={setting.key}
            label={setting.label}
            required={setting.required}
            description={setting.description}
            value={this.props.value || setting.default}
            error={this.props.error}
            ref="element"
            />
            { setting.randomizable && !this.props.value &&
              <div className="text-right">
                <button
                  className="btn btn-default"
                  disabled={this.props.disabled}
                  onClick={this.randomize}
                  type="button">
                  Set to random value
                </button>
              </div>
            }
        </div>
      );
    } else if (setting.type === "number") {
      return (
        <EditableInput
          elementType="input"
          validation="number"
          required={setting.required}
          step={1}
          disabled={this.props.disabled}
          name={setting.key}
          label={setting.label}
          description={setting.description}
          value={this.props.value || setting.default}
          error={this.props.error}
          ref="element"
          />
      );
    } else if (setting.type === "select") {
      return (
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          name={setting.key}
          required={setting.required}
          label={setting.label}
          description={setting.description}
          value={this.props.value || setting.default}
          ref="element"
          >
          { setting.options && setting.options.map(option =>
              <option key={option.key} value={option.key}>{option.label}</option>
            )
          }
        </EditableInput>
      );
    } else if (setting.type === "list" && setting.options) {
      return (
        <div>
          <label>{setting.label}</label>
          { setting.description &&
            <span className="description" dangerouslySetInnerHTML={{__html: setting.description}} />
          }
          { setting.options.map(option =>
              <EditableInput
                key={option.key}
                elementType="input"
                type="checkbox"
                required={setting.required}
                disabled={this.props.disabled}
                name={`${setting.key}_${option.key}`}
                label={option.label}
                error={this.props.error}
                checked={this.shouldBeChecked(option)}
                />
            )
          }
        </div>
      );
    } else if (setting.type === "list") {
      return (
        <div>
          <label>{setting.label}</label>
          { setting.description &&
            <span className="description" dangerouslySetInnerHTML={{__html: setting.description}} />
          }
          { this.state.listItems && this.state.listItems.map(listItem =>
              <WithRemoveButton
                disabled={this.props.disabled}
                onRemove={() => this.removeListItem(listItem)}
                >
                <EditableInput
                  elementType="input"
                  type="text"
                  required={setting.required}
                  disabled={this.props.disabled}
                  name={setting.key}
                  value={listItem}
                  error={this.props.error}
                  />
              </WithRemoveButton>
            )
          }
          <div>
            <span className="add-list-item">
              <EditableInput
                elementType="input"
                type="text"
                required={setting.required}
                disabled={this.props.disabled}
                name={setting.key}
                ref="addListItem"
                error={this.props.error}
                />
            </span>
            <button
              type="button"
              className="btn btn-default add-list-item"
              disabled={this.props.disabled}
              onClick={this.addListItem}
              >Add</button>
          </div>
        </div>
      );
    } else if (setting.type === "image") {
      return (
        <div>
          <label>{setting.label}</label>
          { this.props.value &&
            <img src={String(this.props.value)} />
          }
          <EditableInput
            elementType="input"
            type="file"
            disabled={this.props.disabled}
            required={setting.required}
            name={setting.key}
            description={setting.description}
            accept="image/*"
            error={this.props.error}
            />
        </div>
      );
    } else if (setting.type === "color-picker") {
      return (
        <div>
          <label>{setting.label}</label>
          { setting.description &&
            <span className="description" dangerouslySetInnerHTML={{__html: setting.description }} />
          }
          <ColorPicker
            value={String(this.props.value || setting.default)}
            setting={setting}
            ref="element"
            />
        </div>
      );
    }
  }

  getValue() {
    if (this.props.setting.type === "list" && !this.props.setting.options) {
      return this.state.listItems;
    } else {
      return (this.refs["element"] as any).getValue();
    }
  }

  removeListItem(listItem: string) {
    this.setState({ listItems: this.state.listItems.filter(stateListItem => stateListItem !== listItem) });
  }

  addListItem() {
    const listItem = (this.refs["addListItem"] as any).getValue();
    this.setState({ listItems: this.state.listItems.concat(listItem) });
    (this.refs["addListItem"] as any).clear();
  }

  randomize() {
    const element = (this.refs["element"] as any);
    const chars = "1234567890abcdefghijklmnopqrstuvwxyz!@#$%^&*()";
    let random = "";
    for (let i = 0; i < 32; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    element.setState({ value: random });
  }

  clear() {
    const element = (this.refs["element"] as any);
    if (element && element.clear) {
      element.clear();
    }
    this.setState({ listItems: [] });
  }


}
