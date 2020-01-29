import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { findDefault, clearForm } from "../utils/sharedFunctions";
import { LibrariesData, LibraryData } from "../interfaces";
import { Panel, Form } from "library-simplified-reusable-components";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import FiltersForm from "./FiltersForm";
import PairedMenus from "./PairedMenus";

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
  constructor(props) {
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

  separateCategories(nonRequiredFields) {
    let categories = {};
    nonRequiredFields.forEach((setting) => {
      categories[setting.category] = categories[setting.category] ? categories[setting.category].concat(setting) : [setting];
    });
    return categories;
  }

  renderForms(categories) {
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

  renderFieldset(fields) {
    let renderPairedMenus = (setting) => {
      let dropdownSetting = fields.find(x => x.key === setting.paired);
      return (
        <PairedMenus
          inputListSetting={setting}
          dropdownSetting={dropdownSetting}
          item={this.props.item}
          disabled={this.props.disabled}
          error={this.props.error}
        />
      );
    };
    return (
      <fieldset>
        <legend className="visuallyHidden">Additional Fields</legend>
        { fields.map(setting => (setting.paired &&
          renderPairedMenus(setting))
        ||
          <ProtocolFormField
            key={setting.key}
            ref={setting.key}
            setting={setting.format === "narrow" ? {...setting, ...{type: "menu"}} : setting}
            additionalData={this.props.additionalData}
            disabled={this.props.disabled}
            value={(this.props.item && this.props.item.settings && this.props.item.settings[setting.key]) || setting.default}
            default={findDefault(setting)}
            error={this.props.error}
            locked={setting.locked}
          />
          )
        }
      </fieldset>
    );
  }

  submit(data: FormData) {
    this.props.save(data);
  }

}
