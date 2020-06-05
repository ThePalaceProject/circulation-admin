import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { findDefault, clearForm } from "../utils/sharedFunctions";
import { LibrariesData, LibraryData, LibrarySettingField, SettingData } from "../interfaces";
import { Panel, Form } from "library-simplified-reusable-components";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import PairedMenus from "./PairedMenus";
import AnnouncementsSection from "./AnnouncementsSection";

export interface LibraryEditFormProps {
  data: LibrariesData;
  item?: LibraryData;
  additionalData?: any;
  disabled: boolean;
  save: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
  error?: FetchErrorData;
}

/** Form for editing a library's configuration, on the libraries tab of the
    system configuration page. */
export default class LibraryEditForm extends React.Component<LibraryEditFormProps, {}> {
  constructor(props: LibraryEditFormProps) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.responseBody && !nextProps.fetchError) {
      clearForm(this.refs);
    }
  }

  render(): JSX.Element {
    let basicInfo = [];
    let otherFields = [];

    if (this.props.data && this.props.data.settings) {
      basicInfo = this.props.data.settings.filter(setting => (setting.required || setting.category === "Basic Information"));
      otherFields = this.props.data.settings.filter(setting => !(new Set(basicInfo).has(setting)));
    }

    let categories = this.separateCategories(otherFields);

    let basicInfoPanel = (
      <Panel
        id="library-basic-info"
        headerText="Basic Information"
        key="basic_info"
        openByDefault={true}
        content={
          <fieldset>
          <legend className="visuallyHidden">Basic Information</legend>
          <EditableInput
            elementType="input"
            type="text"
            disabled={this.props.disabled}
            required={true}
            name="name"
            ref="name"
            label="Name"
            value={this.props.item && this.props.item.name}
            description="The human-readable name of this library."
            error={this.props.error}
          />
          <EditableInput
            elementType="input"
            type="text"
            disabled={this.props.disabled}
            required={true}
            name="short_name"
            ref="short_name"
            label="Short name"
            value={this.props.item && this.props.item.short_name}
            description="A short name of this library, to use when identifying it in scripts or URLs, e.g. 'NYPL'."
            error={this.props.error}
          />
          { basicInfo.map(setting =>
            <ProtocolFormField
              key={setting.key}
              ref={setting.key}
              setting={setting}
              disabled={this.props.disabled}
              value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
              default={findDefault(setting)}
              error={this.props.error}
            />
          )
        }
        </fieldset>
      }
    />);

    return (
      <Form
        hiddenName="uuid"
        hiddenValue={this.props.item && this.props.item.uuid}
        className="edit-form"
        disableButton={this.props.disabled}
        onSubmit={this.submit}
        content={[basicInfoPanel, this.renderForms(categories)]}
      />);
  }

  separateCategories(nonRequiredFields: LibrarySettingField[]) {
    let categories = {};
    nonRequiredFields.forEach((setting) => {
      categories[setting.category] = categories[setting.category] ? categories[setting.category].concat(setting) : [setting];
    });
    return categories;
  }

  renderForms(categories: {[key: string]: LibrarySettingField[]}) {
    let forms = [];
    let tempAnnouncementsForm =
    <Panel
      id={`library-form-announcements`}
      headerText={`Announcements (Optional)`}
      onEnter={this.submit}
      key="announcements"
      content={
        <AnnouncementsSection setting={{
              description: "announcements",
              format: "date-range",
              key: "announcements",
              label: "Announcements",
              type: "list"}}
              value={[{content: "FIRST ANNOUNCEMENT", startDate: "2020-05-19", endDate: "2020-05-21", position: 1}, {content: "SECOND ANNOUNCEMENT", startDate: "2020-06-01", endDate: "2020-08-01", position: 2}]}
              ref="announcements"
        />
      }
      openByDefault={true}
    />;
    forms.push(tempAnnouncementsForm);
    let categoryNames = Object.keys(categories);
    categoryNames.forEach((name) => {
      let form =
        <Panel
          id={`library-form-${name.replace(/\s/g, "-")}`}
          headerText={`${name} (Optional)`}
          onEnter={this.submit}
          key={name}
          content={this.renderFieldset(categories[name])}
        />;
      forms.push(form);
    });
    return forms;
  }

  renderPairedMenus(setting: SettingData, fields: LibrarySettingField[]) {
    let dropdownSetting = fields.find(x => x.key === setting.paired);
    // These dropdown settings have the :skip: attribute, so they'll get rendered only here;
    // when the iterator in renderFieldset gets to them, they'll get skipped over, not rendered a second time.
    return (
      <PairedMenus
        inputListSetting={setting}
        dropdownSetting={dropdownSetting}
        item={this.props.item}
        disabled={this.props.disabled}
        error={this.props.error}
      />
    );
  }

  renderFieldset(fields: SettingData[]) {
    let formatSetting = (setting: SettingData) => {
      if (setting.format === "narrow") {
        // We need to tell the ProtocolFormField to make an InputList with a menu that gets narrowed down.
        return {...setting, ...{type: "menu"}};
      }
      return setting;
    };
    let settingValue = (setting: SettingData) => {
      // Does the library already have a saved value for this setting?
      if (this.props.item?.settings) {
        return this.props.item.settings[setting.key];
      }
      return setting.default;
    };
    return (
      <fieldset>
        <legend className="visuallyHidden">Additional Fields</legend>
        { fields.map(setting => setting.paired ?
          this.renderPairedMenus(setting, fields)
        :
          !setting.skip &&
          <ProtocolFormField
            key={setting.key}
            ref={setting.key}
            setting={formatSetting(setting)}
            additionalData={this.props.additionalData}
            disabled={this.props.disabled}
            value={settingValue(setting)}
            default={findDefault(setting)}
            error={this.props.error}
            readOnly={setting.readOnly}
          />
        )}
      </fieldset>
    );
  }

  submit(data: FormData) {
    let announcements = (this.refs["announcements"] as any).getValue();
    let announcementList = [];
    announcements.forEach(a => announcementList.push(a));
    data?.set("announcements", JSON.stringify(announcementList));
    this.props.save(data);
  }

}
