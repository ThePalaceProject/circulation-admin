import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { findDefault, clearForm } from "../utils/sharedFunctions";
import { LibrariesData, LibraryData, LibrarySettingField, SettingData, AnnouncementData } from "../interfaces";
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
  adminLevel?: number;
}

/** Form for editing a library's configuration, on the libraries tab of the
    system configuration page. */
export default class LibraryEditForm extends React.Component<LibraryEditFormProps, {}> {
  private nameRef = React.createRef<EditableInput>();
  private shortNameRef = React.createRef<EditableInput>();
  private settingRef = React.createRef<ProtocolFormField>();
  private announcementsRef = React.createRef<AnnouncementsSection>();
  constructor(props: LibraryEditFormProps) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.responseBody && !nextProps.fetchError) {
      clearForm([
        this.nameRef.current,
        this.shortNameRef.current,
        this.settingRef.current,
        this.announcementsRef.current
      ]);
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
            ref={this.nameRef}
            label="Name"
            value={this.props.item && this.props.item.name}
            description="The human-readable name of this library."
            error={this.props.error}
            readOnly={this.props.adminLevel < 2}
          />
          <EditableInput
            elementType="input"
            type="text"
            disabled={this.props.disabled}
            required={true}
            name="short_name"
            ref={this.shortNameRef}
            label="Short name"
            value={this.props.item && this.props.item.short_name}
            description="A short name of this library, to use when identifying it in scripts or URLs, e.g. 'NYPL'."
            error={this.props.error}
          />
          { basicInfo.map(setting =>
            <ProtocolFormField
              key={setting.key}
              ref={this.settingRef}
              setting={setting}
              disabled={this.props.disabled || (setting.level && (setting.level > this.props.adminLevel))}
              value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
              default={findDefault(setting)}
              error={this.props.error}
              readOnly={setting.level && (setting.level > this.props.adminLevel)}
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

  renderAnnouncements(setting: SettingData, value) {
    return (
      <AnnouncementsSection
            setting={{...setting, ...{format: "date-range"}}}
            value={value && JSON.parse(value)}
            ref={this.announcementsRef}
      />
    );
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
        disabled={this.props.disabled || (setting.level && (setting.level > this.props.adminLevel))}
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
    let render = (setting) => {
      if (setting.paired) {
        return this.renderPairedMenus(setting, fields);
      } else if (setting.type === "announcements") {
        return this.renderAnnouncements(setting, settingValue(setting));
      } else if (!setting.skip) {
        return (
          <ProtocolFormField
            key={setting.key}
            ref={this.settingRef}
            setting={formatSetting(setting)}
            additionalData={this.props.additionalData}
            disabled={this.props.disabled || (setting.level && (setting.level > this.props.adminLevel))}
            value={settingValue(setting)}
            default={findDefault(setting)}
            error={this.props.error}
            readOnly={setting.readOnly}
          />
        );
      }
    };
    return (
      <fieldset>
        <legend className="visuallyHidden">Additional Fields</legend>
        { fields.map(setting => render(setting))}
      </fieldset>
    );
  }

  submit(data: FormData) {
    let announcements = this.announcementsRef.current.getValue();
    let announcementList = [];
    announcements.forEach((a: AnnouncementData) => announcementList.push(a));
    data?.set("announcements", JSON.stringify(announcementList));
    this.props.save(data);
  }

}
