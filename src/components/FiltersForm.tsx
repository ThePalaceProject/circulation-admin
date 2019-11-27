import * as React from "react";
import { SettingData, LibraryData } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";
import ProtocolFormField from "./ProtocolFormField";
import InputList from "./InputList";
import { findDefault } from "../utils/sharedFunctions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface FiltersFormProps {
  submit: (data: FormData) => void;
  content: SettingData[];
  disabled: boolean;
  item?: LibraryData;
  error?: FetchErrorData;
}

export interface FiltersFormState {
  available?: string[];
  collection?: string[];
  order?: string[];
}

export default class FiltersForm extends React.Component<FiltersFormProps, FiltersFormState> {
  private available = React.createRef<ProtocolFormField>();
  private collection = React.createRef<ProtocolFormField>();
  private order = React.createRef<ProtocolFormField>();

  constructor(props: FiltersFormProps) {
    super(props);
    let item = this.props.item;
    let available;
    let collection;
    let order;
    if (item) {
      available = item.settings.facets_enabled_available as string[];
      collection = item.settings.facets_enabled_collection as string[];
      order = item.settings.facets_enabled_order as string[];
    } else {
      available = props.content.find(x => x.key == "facets_enabled_available").default;
      collection = props.content.find(x => x.key == "facets_enabled_collection").default;
      order = props.content.find(x => x.key == "facets_enabled_order").default;
    }
    this.state = { available, collection, order };
    this.onChange = this.onChange.bind(this);
  }

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

  findCorresponding(setting: SettingData): any {
    let settingName = setting.key;
    let settingIsAbout = settingName.split("_")[2];
    let itemSettings = this.props.item && this.props.item.settings;
    let correspondingName;
    if (itemSettings) {
      correspondingName = Object.keys(itemSettings).find(k => k === `facets_enabled_${settingIsAbout}`);
      return itemSettings[correspondingName];
    } else {
      return [setting.default];
    }
  }

  onChange(e) {
    // debugger
    this.order.current.getValue();
  }

  getValue(setting: SettingData) {
    let value = this.props.item && this.props.item.settings ?
      this.props.item.settings[setting.key] : setting.default;
    return value;
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
    )
  }

  makeCheckboxSet(setting: SettingData) {
    return (
      <ProtocolFormField
        key={setting.key}
        ref={this[`${setting.key.split("_")[2]}`]}
        setting={setting}
        disabled={this.props.disabled}
        value={this.getValue(setting)}
        default={findDefault(setting)}
        error={this.props.error}
        onChange={this.onChange}
      />
    );
  }

  makeDropdownMenu(setting: SettingData) {
    let availableOptions: string[] = this.findCorresponding(setting);
    let displayOnly = setting.options.filter(o => availableOptions.includes(o.key));
    setting = {...setting as any, ...{options: displayOnly}};
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

  renderContent(setting: SettingData) {
    if (setting.type === "number") {
      return this.makeNumberField(setting);
    } else if (setting.type === "select") {
      return this.makeDropdownMenu(setting);
    } else if (setting.type === "list"){
      return this.makeCheckboxSet(setting);
    }
  }
}
