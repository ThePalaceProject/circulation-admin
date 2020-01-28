import * as React from "react";
import { SettingData, LibraryData } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";
import ProtocolFormField from "./ProtocolFormField";
import InputList from "./InputList";
import { findDefault } from "../utils/sharedFunctions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import PairedMenus from "./PairedMenus";

export interface FiltersFormProps {
  submit: (data: FormData) => void;
  content: SettingData[];
  disabled: boolean;
  item?: LibraryData;
  error?: FetchErrorData;
}


export default class FiltersForm extends React.Component<FiltersFormProps, {}> {

  render() {
    return (
      <Panel
        openByDefault={true}
        headerText="Lanes & Filters (Optional)"
        onEnter={this.props.submit}
        key="Lanes & Filters"
        content={this.props.content.map(x => this.renderContent(x))}
      />
    );
  }

  // findCorresponding(setting: SettingData): any {
  //   let settingName = setting.key;
  //   let settingIsAbout = settingName.split("_")[2];
  //   let itemSettings = this.props.item && this.props.item.settings;
  //   let correspondingName: string;
  //   if (itemSettings) {
  //     correspondingName = Object.keys(itemSettings).find(k => k === `facets_enabled_${settingIsAbout}`);
  //     return itemSettings[correspondingName];
  //   } else {
  //     return [setting.default];
  //   }
  // }
  findDropdownSetting(setting: SettingData): any {
    let settingName = setting.key;
    let settingIsAbout = settingName.split("_")[2];
    let dropdownSettingName = `facets_default_${settingIsAbout}`;
    let dropdownSetting = this.props.content.find(x => x.key === dropdownSettingName);
    return dropdownSetting;
  }

  getValue(setting: SettingData) {
    let value = this.props.item && this.props.item.settings ?
      this.props.item.settings[setting.key] : setting.default;
    return value;
  }

  makePairedMenus(inputListSetting: SettingData) {
    let dropdownSetting = this.findDropdownSetting(inputListSetting);
    return (
      <PairedMenus
        inputListSetting={inputListSetting}
        dropdownSetting={dropdownSetting}
        item={this.props.item}
        disabled={this.props.disabled}
        error={this.props.error}
      />
    );
  }

  makeNumberField(setting: SettingData) {
    return (
      <ProtocolFormField
        key={setting.key}
        ref={setting.key}
        setting={setting}
        disabled={this.props.disabled}
        value={this.getValue(setting)}
        default={findDefault(setting)}
        error={this.props.error}
      />
    );
  }

  // makeDropdownMenu(setting: SettingData) {
  //   let availableOptions: string[] = this.findCorresponding(setting);
  //   let displayOnly = setting.options.filter(o => availableOptions && availableOptions.includes(o.key));
  //   setting = {...setting as any, ...{options: displayOnly}};
  //   return (
  //     <ProtocolFormField
  //       key={setting.key}
  //       ref={setting.key}
  //       setting={setting}
  //       disabled={this.props.disabled}
  //       value={this.getValue(setting)}
  //       default={findDefault(setting)}
  //       error={this.props.error}
  //     />
  //   );
  // }

  renderContent(setting: SettingData) {
    if (setting.type === "number") {
      return this.makeNumberField(setting);
    } else if (setting.type === "list") {
      return this.makePairedMenus(setting);
    }
  }
}
