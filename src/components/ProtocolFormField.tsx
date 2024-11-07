import * as React from "react";
import EditableInput from "./EditableInput";
import ColorPicker from "./ColorPicker";
import { Button } from "library-simplified-reusable-components";
import InputList from "./InputList";
import { SettingData, CustomListsSetting } from "../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export interface ProtocolFormFieldProps {
  setting: SettingData | CustomListsSetting;
  disabled: boolean;
  value?:
    | string
    | string[]
    | object[]
    | Array<string | object | JSX.Element>
    | JSX.Element;
  altValue?: string;
  default?: any;
  error?: FetchErrorData;
  additionalData?: any;
  onSubmit?: any;
  onEmpty?: string;
  title?: string;
  onChange?: any;
  readOnly: boolean;
  disableButton?: boolean;
}

const valueIsMissing = (value: any): boolean =>
  value === undefined || value === null;

export const defaultValueIfMissing = (value: any, defaultValue: any) =>
  valueIsMissing(value) ? defaultValue : value;

/** Shows a form field for editing a single setting, based on setting information
    from the server. */
export default class ProtocolFormField extends React.Component<
  ProtocolFormFieldProps,
  object
> {
  private inputListRef = React.createRef<InputList>();
  private colorPickerRef = React.createRef<ColorPicker>();
  private elementRef = React.createRef<EditableInput>();
  static defaultProps = {
    readOnly: false,
  };
  constructor(props: ProtocolFormFieldProps) {
    super(props);
    this.randomize = this.randomize.bind(this);
    this.isDefault = this.isDefault.bind(this);
    this.createEditableInput = this.createEditableInput.bind(this);
  }

  render(): JSX.Element {
    const setting = this.props.setting as SettingData | CustomListsSetting;
    if (setting.type === "select") {
      return this.renderSelectSetting(setting);
    } else if (setting.type === "list" || setting.type === "menu") {
      return this.renderListSetting(setting);
    } else if (setting.type === "color-picker") {
      return this.renderColorPickerSetting(setting);
    } else {
      return this.renderSetting(setting);
    }
  }

  renderSetting(setting: SettingData): JSX.Element {
    return (
      <div className={setting.randomizable ? "randomizable" : ""}>
        {!valueIsMissing(this.props?.value) && setting.type === "image" && (
          <img src={String(this.props.value)} alt="" role="presentation" />
        )}
        {this.createEditableInput(setting)}
        {setting.randomizable && !this.props.value && (
          <div className="text-right">
            <Button
              disabled={this.props.disabled}
              callback={this.randomize}
              content={"Set to random value"}
              type="button"
            />
          </div>
        )}
      </div>
    );
  }

  createEditableInput(
    setting: SettingData,
    customProps = null,
    children = null
  ): JSX.Element {
    const elementType =
      setting.type && ["text", "textarea", "select"].includes(setting.type)
        ? setting.type
        : "input";

    const type = setting.type === "date-picker" ? "date" : "text";

    const extraProps = {
      image: {
        accept: "image/*",
        type: "file",
        value: undefined,
      },
      number: {
        validation: "number",
        step: 1,
      },
    };

    const basicProps = {
      key: setting.key,
      elementType: elementType,
      type: type,
      disabled: this.props && this.props.disabled,
      name: setting.key,
      label: setting.label,
      required: setting.required,
      description: setting.description,
      value: defaultValueIfMissing(this.props.value, setting.default),
      error: this.props && this.props.error,
      ref: this.elementRef,
      onChange: this.props.onChange,
      readOnly: this.props.readOnly,
    };
    let props = extraProps[setting.type]
      ? { ...basicProps, ...extraProps[setting.type] }
      : basicProps;
    if (customProps) {
      props = { ...props, ...customProps };
    }
    return React.createElement(EditableInput, props, children);
  }

  renderSelectSetting(setting: SettingData): JSX.Element {
    const children =
      setting.options &&
      setting.options.map((option) => (
        <option key={option.key} value={option.key} aria-selected={false}>
          {option.label}
        </option>
      ));
    return this.createEditableInput(setting, null, children);
  }

  renderListSetting(setting: SettingData | CustomListsSetting): JSX.Element {
    // Flatten an object in which the values are arrays
    const value = Array.isArray(this.props.value)
      ? this.props.value
      : this.props.value &&
        // eslint-disable-next-line prefer-spread
        [].concat.apply([], Object.values(this.props.value));
    // Currently, the use case for the disableButton prop is to tell the InputList
    // whether the admin should be able to click the buttons to add and delete list items.
    // The readOnly prop tells the InputList whether the input fields should let the admin type or
    // select (if it's a menu) new items.
    return (
      <InputList
        ref={this.inputListRef}
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
        readOnly={this.props.readOnly}
        disableButton={this.props.disableButton}
      />
    );
  }

  renderColorPickerSetting(setting: SettingData): JSX.Element {
    return (
      <div>
        {this.labelAndDescription(setting)}
        <ColorPicker
          value={String(this.props.value || setting.default)}
          setting={setting}
          ref={this.colorPickerRef}
        />
      </div>
    );
  }

  labelAndDescription(setting: SettingData): JSX.Element[] {
    const label = <label key={setting.label}>{setting.label}</label>;
    const description = setting.description && (
      <span
        key={setting.description}
        className="description"
        dangerouslySetInnerHTML={{ __html: setting.description }}
      />
    );
    const instructions = setting.instructions && (
      <div
        className="well description"
        dangerouslySetInnerHTML={{ __html: setting.instructions }}
      ></div>
    );
    return [label, description, instructions];
  }

  isDefault(option: JSX.Element) {
    if (this.props.default) {
      return (
        this.props.default.indexOf(option) >= 0 ||
        this.props.default.indexOf(option.key) >= 0
      );
    }
  }

  getValue() {
    return this.findRef().getValue();
  }

  randomize() {
    const element = this.findRef();
    const chars = "1234567890abcdefghijklmnopqrstuvwxyz!@#$%^&*()";
    let random = "";
    for (let i = 0; i < 32; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    element?.setState({ value: random });
  }

  findRef() {
    return (this.inputListRef?.current ||
      this.elementRef?.current ||
      this.colorPickerRef?.current) as any;
  }

  clear() {
    const element = this.findRef();
    if (element && element.clear) {
      element.clear();
    }
  }
}
