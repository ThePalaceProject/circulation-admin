import * as React from "react";
import EditableInput from "./EditableInput";
import WithRemoveButton from "./WithRemoveButton";
import ColorPicker from "./ColorPicker";
import ToolTip from "./ToolTip";
import SaveButton from "./SaveButton";
import InputList from "./InputList";
import { LocatorIcon } from "@nypl/dgx-svg-icons";
import { SettingData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface ProtocolFormFieldProps {
  setting: SettingData;
  disabled: boolean;
  value?: string | any[];
  default?: any;
  error?: FetchErrorData;
}

/** Shows a form field for editing a single setting, based on setting information
    from the server. */
export default class ProtocolFormField extends React.Component<ProtocolFormFieldProps, void> {
  constructor(props) {
    super(props);
    this.randomize = this.randomize.bind(this);
    this.isDefault = this.isDefault.bind(this);
    this.shouldBeChecked = this.shouldBeChecked.bind(this);
  }

  render(): JSX.Element {
    const setting = this.props.setting;
    if (setting.type === "select") {
      return this.renderSelectSetting(setting);
    } else if (setting.type === "list" && setting.options) {
        return this.renderListSettingWithOptions(setting);
    } else if (setting.type === "list") {
        return this.renderListSetting(setting);
    } else if (setting.type === "color-picker") {
        return this.renderColorPickerSetting(setting);
    } else {
        return this.renderSetting(setting);
    }
  }

  renderSetting(setting: SettingData, customProps = null): JSX.Element {
    return (
      <div className={setting.randomizable ? "randomizable" : ""}>
        {this.props.value && setting.type === "image" && <img src={String(this.props.value)} />}
        {
          this.createEditableInput(setting)
        }
        { setting.randomizable && !this.props.value &&
          <div className="text-right">
            <SaveButton disabled={this.props.disabled} submit={this.randomize} text={"Set to random value"} type="button" />
          </div>
        }
      </div>
    );
  }

  createEditableInput(setting: SettingData, customProps = null, children = null): JSX.Element {
    let elementType = setting.type && ["text", "textarea", "select"].includes(setting.type) ? setting.type : "input";

    const extraProps = {
      "image": {
        accept: "image/*",
        type: "file",
        value: undefined
      },
      "number": {
        validation: "number",
        step: 1
      }
    };

    const basicProps = {
      key: setting.key,
      elementType: elementType,
      type: "text",
      disabled: this.props && this.props.disabled,
      name: setting.key,
      label: setting.label,
      required: setting.required,
      description: setting.description,
      value: (this.props && this.props.value) || setting.default,
      error: this.props && this.props.error,
      ref: "element"
    };

    let props = extraProps[setting.type] ? {...basicProps, ...extraProps[setting.type]} : basicProps;
    if (customProps) {
      props = {...props, ...customProps};
    }
    return React.createElement(EditableInput, props, children);
  }

  renderSelectSetting(setting): JSX.Element {
    let children = setting.options && setting.options.map(option =>
      <option key={option.key} value={option.key}>{option.label}</option>
    );
    return this.createEditableInput(setting, null, children);
  }

  renderListSettingWithOptions(setting): JSX.Element {
    return (
      <div>
        { this.labelAndDescription(setting) }
        { setting.options.map((option) => {
            return this.createEditableInput(option, {
                type: "checkbox",
                required: setting.required,
                name: `${setting.key}_${option.key}`,
                checked: this.shouldBeChecked(option)
              });
            })
        }
      </div>
    );
  }

  renderListSetting(setting): JSX.Element {
    return (
      <InputList
        ref="element"
        setting={setting}
        createEditableInput={this.createEditableInput}
        labelAndDescription={this.labelAndDescription}
        disabled={this.props.disabled}
        toolTip={this.toolTip}
        value={this.props.value}
      />
    );
  }

  renderColorPickerSetting(setting): JSX.Element {
    return (
      <div>
        { this.labelAndDescription(setting) }
        <ColorPicker
          value={String(this.props.value || setting.default)}
          setting={setting}
          ref="element"
        />
      </div>
    );
  }

  labelAndDescription(setting: SettingData): JSX.Element[] {
    let label = (
      <label key={setting.label}>
        {setting.label}
        {setting.instructions && <ToolTip trigger={<span className="badge">?</span>} text={setting.instructions} direction="vertical" />}
      </label>
    );

    let description = setting.description && (
      <span key={setting.description} className="description" dangerouslySetInnerHTML={{__html: setting.description }} />
    );
    return [label, description];
  }

  toolTip(item, format) {
    const icons = {
      "geographic": <LocatorIcon />
    };

    if (typeof(item) === "object") {
      return (
        <span className="input-group-addon">
          <ToolTip trigger={icons[format]} direction="point-right" text={Object.values(item)[0]}/>
        </span>
      );
    }
    return null;
  }

  isDefault(option) {
    if (this.props.default) {
      return this.props.default.indexOf(option) >= 0 || this.props.default.indexOf(option.key) >= 0;
    }
  }

  shouldBeChecked(option) {
    let isValue = this.props.value &&
      (typeof(this.props.value) === "string" || (Array.isArray(this.props.value) && this.props.value.every(x => typeof(x) === "string"))) &&
      (this.props.value === option.key || Array.isArray(this.props.value) && this.props.value.includes(option.key));
    let isDefault = (!this.props.value && this.isDefault(option));
    return isValue || isDefault;
  }

  getValue() {
    return (this.refs["element"] as any).getValue();
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
  }
}
