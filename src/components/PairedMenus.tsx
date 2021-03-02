import * as React from "react";
import { SettingData, LibraryData } from "../interfaces";
import ProtocolFormField from "./ProtocolFormField";
import InputList from "./InputList";
import EditableInput from "./EditableInput";
import { findDefault } from "../utils/sharedFunctions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface PairedMenusProps {
  inputListSetting: SettingData;
  dropdownSetting: SettingData;
  item?: LibraryData;
  disabled: boolean;
  readOnly?: boolean;
  error?: FetchErrorData;
}

export interface PairedMenusState {
  inputListValues: string[];
  dropdownValue: string;
}

/**
 * Renders an InputList component and a dropdown menu.  The values in the dropdown menu
 * are filtered to reflect the current InputList values--i.e. you can only add a value from
 * the dropdown if it has already been added to the InputList.
*/

export default class PairedMenus extends React.Component<PairedMenusProps, PairedMenusState> {
  constructor(props: PairedMenusProps) {
    super(props);
    let existingInput = this.existingInput();
    this.state = { inputListValues: existingInput, dropdownValue: this.props.dropdownSetting ? (this.getValueFromItem(this.props.dropdownSetting) as string) : "" };
    this.updateInputList = this.updateInputList.bind(this);
    this.renderDropdown = this.renderDropdown.bind(this);
  }

  existingInput(): string[] {
    let item = this.props.item;
    let key = this.props.inputListSetting.key;
    if (item && item.settings[key]) {
      return item.settings[key] as string[];
    } else {
      return this.props.inputListSetting.default as string[];
    }
  }

  render() {
    return (
      <fieldset className="paired-menus">
        {this.renderInputList(this.props.inputListSetting.options)}
        {this.props.dropdownSetting && this.renderDropdown()}
      </fieldset>
    );
  }

  updateInputList(currentList) {
    this.setState({...this.state, ...{inputListValues: currentList.listItems}});
  }

  onDropdownChange(value: string) {
    this.setState({...this.state, ...{dropdownValue: value}});
  }

  getValueFromItem(setting: SettingData) {
    let value = this.props.item && this.props.item.settings ?
      this.props.item.settings[setting.key] : setting.default;
    return value;
  }

  renderInputList(options: SettingData[]) {
    let makeOption = (x: SettingData) => <option value={x.key} key={x.key} aria-selected={false}>{x.label}</option>;
    return (
      <ProtocolFormField
        setting={{...this.props.inputListSetting, ...{type: "menu", format: "narrow", menuOptions: options.map(o => makeOption(o))}}}
        value={this.state.inputListValues}
        disabled={this.props.disabled}
        onChange={this.updateInputList}
        disableButton={this.props.readOnly || this.props.disabled}
        readOnly={true}
        ref={this.props.inputListSetting.key}
      />
    );
  }

  renderDropdown() {
    let setting = {...this.props.dropdownSetting};
    let available = this.state.inputListValues && setting.options.filter(o => this.state.inputListValues.includes(o.key));
    if (available && available.length === 0) {
      return (
        <p className="bg-warning">In order to set this value, you must add at least one option from the menu above.</p>
      );
    }
    setting = {...setting, ...{options: available}};
    return (
      <ProtocolFormField
        key={setting.key}
        ref={setting.key}
        setting={setting}
        disabled={this.props.disabled}
        value={this.getValueFromItem(setting)}
        default={findDefault(setting)}
        error={this.props.error}
        onChange={(e: string) => this.onDropdownChange(e)}
      />
    );
  }

  getValue() {
    return this.state;
  }
}
