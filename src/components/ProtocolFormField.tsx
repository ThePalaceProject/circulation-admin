import * as React from "react";
import EditableInput from "./EditableInput";
import ColorPicker from "./ColorPicker";
import { Button } from "library-simplified-reusable-components";
import InputList from "./InputList";
import { SettingData, CustomListsSetting } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface ProtocolFormFieldProps {
  setting: SettingData | CustomListsSetting;
  disabled: boolean;
  value?: string | string[] | {}[] | Array<string | {} | JSX.Element> | JSX.Element;
  altValue?: string;
  default?: any;
  error?: FetchErrorData;
  additionalData?: any;
  onSubmit?: any;
  onEmpty?: string;
  title?: string;
  onChange?: any;
  locked?: boolean;
  optionalText?: boolean;
}

/** Shows a form field for editing a single setting, based on setting information
    from the server. */
export default class ProtocolFormField extends React.Component<ProtocolFormFieldProps, {}> {
  constructor(props) {
    super(props);
    this.randomize = this.randomize.bind(this);
    this.isDefault = this.isDefault.bind(this);
    this.shouldBeChecked = this.shouldBeChecked.bind(this);
    this.createEditableInput = this.createEditableInput.bind(this);
  }

  render(): JSX.Element {
    const setting = this.props.setting as SettingData | CustomListsSetting;
    if (setting.type === "select") {
      return this.renderSelectSetting(setting);
    // } else if (setting.type === "list" && setting.options) {
    //     return this.renderListSettingWithOptions(setting);
    } else if (setting.type === "list" || setting.type === "menu") {
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
        {this.props.value && setting.type === "image" && <img src={String(this.props.value)} alt="" role="presentation" />}
        {
          this.createEditableInput(setting)
        }
        { setting.randomizable && !this.props.value &&
          <div className="text-right">
            <Button disabled={this.props.disabled} callback={this.randomize} content={"Set to random value"} type="button" />
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
      ref: "element",
      onChange: this.props.onChange,
    };
    let props = extraProps[setting.type] ? {...basicProps, ...extraProps[setting.type]} : basicProps;
    if (customProps) {
      props = {...props, ...customProps};
    }
    return React.createElement(EditableInput, props, children);
  }

  renderSelectSetting(setting: SettingData): JSX.Element {
    let children = setting.options && setting.options.map(option =>
      <option key={option.key} value={option.key} aria-selected={false}>{option.label}</option>
    );
    return this.createEditableInput(setting, null, children);
  }

  renderListSettingWithOptions(setting: SettingData): JSX.Element {
    return (
      <div>
        { setting.label && this.labelAndDescription(setting) }
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


  renderListSetting(setting: SettingData | CustomListsSetting): JSX.Element {
    // Flatten an object in which the values are arrays
    let value = Array.isArray(this.props.value) ?
      this.props.value :
      (this.props.value && [].concat.apply([], Object.values(this.props.value)));
    return (
      <InputList
        ref="element"
        setting={setting}
        createEditableInput={this.createEditableInput}
        labelAndDescription={setting.label && this.labelAndDescription}
        disabled={this.props.disabled}
        value={value}
        altValue={this.props.altValue}
        additionalData={this.props.additionalData}
        onSubmit={this.props.onSubmit}
        onEmpty={this.props.onEmpty}
        title={this.props.title}
        onChange={this.props.onChange}
        locked={this.props.locked}
        optionalText={this.props.optionalText}
      />
    );
  }

  renderColorPickerSetting(setting: SettingData): JSX.Element {
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
      </label>
    );
    let description = setting.description && (
      <span key={setting.description} className="description" dangerouslySetInnerHTML={{__html: setting.description }} />
    );
    let instructions = setting.instructions && (
      <div className="well description" dangerouslySetInnerHTML={{__html: setting.instructions }}></div>
    );
    return [label, description, instructions];
  }

  isDefault(option) {
    if (this.props.default) {
      return this.props.default.indexOf(option) >= 0 || this.props.default.indexOf(option.key) >= 0;
    }
  }

  shouldBeChecked(option) {
    let isArray = this.props.value && Array.isArray(this.props.value);
    let isAllStrings = isArray && (this.props.value as any).every(x => typeof(x) === "string");
    let hasKey = isArray && (this.props.value as any).includes(option.key);

    let isValue = this.props.value &&
      (typeof(this.props.value) === "string" || isAllStrings) &&
      (this.props.value === option.key || hasKey);
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
