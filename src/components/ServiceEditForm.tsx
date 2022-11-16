import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { Panel, Button, Form } from "library-simplified-reusable-components";
import WithEditButton from "./WithEditButton";
import WithRemoveButton from "./WithRemoveButton";
import {
  LibraryData,
  LibraryWithSettingsData,
  ProtocolData,
  ServiceData,
  ServicesData,
  SettingData,
} from "../interfaces";
import { clearForm } from "../utils/sharedFunctions";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export interface ServiceEditFormProps<T> {
  data: T;
  item?: ServiceData;
  disabled: boolean;
  save?: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
  error?: FetchErrorData;
  extraFormSection?: any;
  extraFormKey?: string;
  adminLevel?: number;
}

export interface ServiceEditFormState {
  protocol: string;
  parentId: string | null;
  libraries: LibraryWithSettingsData[];
  expandedLibraries: string[];
  selectedLibrary: string | null;
  analyticsOption?: string | null;
}

/** Form for editing service configuration based on protocol information from the server.
    Used on most tabs on the system configuration page. */
export default class ServiceEditForm<
  T extends ServicesData
> extends React.Component<ServiceEditFormProps<T>, ServiceEditFormState> {
  private extraForm = React.createRef();
  constructor(props) {
    super(props);
    let defaultProtocol;
    if (this.availableProtocols().length) {
      defaultProtocol = this.availableProtocols()[0].name;
    }
    this.state = {
      protocol:
        (this.props.item && this.props.item.protocol) || defaultProtocol,
      parentId:
        (this.props.item &&
          this.props.item.parent_id &&
          String(this.props.item.parent_id)) ||
        null,
      libraries: (this.props.item && this.props.item.libraries) || [],
      expandedLibraries: [],
      selectedLibrary: null,
      analyticsOption: null,
    };
    this.handleProtocolChange = this.handleProtocolChange.bind(this);
    this.handleParentChange = this.handleParentChange.bind(this);
    this.selectLibrary = this.selectLibrary.bind(this);
    this.addLibrary = this.addLibrary.bind(this);
    this.editLibrary = this.editLibrary.bind(this);
    this.expandLibrary = this.expandLibrary.bind(this);
    this.removeLibrary = this.removeLibrary.bind(this);
    this.handleData = this.handleData.bind(this);
    this.submit = this.submit.bind(this);
    this.renderRequiredFields = this.renderRequiredFields.bind(this);
    this.renderOptionalFields = this.renderOptionalFields.bind(this);
    this.renderLibrariesForm = this.renderLibrariesForm.bind(this);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    let protocol = this.state.protocol;
    let parentId = this.state.parentId;
    let libraries = this.state.libraries;
    if (newProps.item && newProps.item.protocol) {
      if (
        !this.props.item ||
        !this.props.item.protocol ||
        this.props.item.protocol !== newProps.item.protocol
      ) {
        protocol = newProps.item.protocol;
      }
    }
    if (!protocol && this.availableProtocols(newProps).length > 0) {
      protocol = this.availableProtocols(newProps)[0].name;
    }

    if (newProps.item && newProps.item.parent_id) {
      if (
        !this.props.item ||
        !this.props.item.parent_id ||
        this.props.item.parent_id !== newProps.item.parent_id
      ) {
        parentId = newProps.item.parent_id;
      }
    }

    if (newProps.item && newProps.item.libraries) {
      if (
        !this.props.item ||
        !this.props.item.libraries ||
        this.props.item.libraries !== newProps.item.libraries
      ) {
        libraries = newProps.item.libraries;
      }
    }
    const newState = Object.assign({}, this.state, {
      protocol,
      parentId,
      libraries,
    });
    this.setState(newState);

    if (newProps.responseBody && !newProps.fetchError) {
      clearForm(this.refs);
    }
  }

  shouldDisable(): boolean {
    return (
      this.props.disabled ||
      (this.props.item?.level && this.props.item.level > this.props.adminLevel)
    );
  }

  render(): JSX.Element {
    const protocol = this.findProtocol();
    const listDataKey = this.props.listDataKey;
    const {
      requiredFields,
      nonRequiredFields,
      extraFields,
    } = this.protocolSettings(protocol);
    const showLibrariesForm =
      !this.sitewide(protocol) ||
      this.protocolLibrarySettings(protocol).length > 0;
    const hasNonRequiredFields = nonRequiredFields.length > 0;
    const hasInstructions =
      this.props.data && this.protocolInstructions(protocol);
    const disabled: boolean = this.shouldDisable();
    const instructions = hasInstructions && (
      <div className="form-group" key="instructions">
        <label className="control-label">Instructions</label>
        <Panel
          id={`form-${listDataKey}-instructions`}
          headerText={this.protocolDescription(protocol)}
          style="instruction"
          onEnter={this.submit}
          content={this.protocolInstructions(protocol)}
        />
      </div>
    );

    const requiredFieldsPanel = (
      <Panel
        key="required"
        id={`form-${listDataKey}-required`}
        headerText="Required Fields"
        openByDefault={true}
        collapsible={hasNonRequiredFields || showLibrariesForm}
        content={this.renderRequiredFields(requiredFields, protocol, disabled)}
      />
    );

    const optionalFieldsPanel = hasNonRequiredFields && (
      <Panel
        id={`form-${listDataKey}-optional`}
        key="optional"
        headerText="Optional Fields"
        content={this.renderOptionalFields(nonRequiredFields, disabled)}
      />
    );
    const extraPanel =
      this.props.extraFormSection &&
      extraFields.length > 0 &&
      React.createElement(this.props.extraFormSection, {
        key: this.props.extraFormKey,
        setting: extraFields[0],
        ref: this.extraForm,
        currentValue:
          this.props.item &&
          this.props.item.settings &&
          this.props.item.settings[this.props.extraFormKey],
        disabled: disabled,
      });

    const librariesForm = showLibrariesForm && (
      <Panel
        key="libraries"
        id={`form-${listDataKey}-libraries`}
        headerText="Libraries"
        content={this.renderLibrariesForm(protocol, disabled)}
      />
    );

    return (
      <Form
        onSubmit={this.submit}
        className="no-border edit-form"
        hiddenName={this.props.item && this.props.item.id && "id"}
        hiddenValue={
          this.props.item && this.props.item.id && String(this.props.item.id)
        }
        disableButton={disabled}
        content={[
          instructions,
          requiredFieldsPanel,
          optionalFieldsPanel,
          extraPanel,
          librariesForm,
        ]}
      />
    );
  }

  renderRequiredFields(
    requiredFields,
    protocol: ProtocolData,
    disabled: boolean
  ) {
    return (
      <fieldset>
        <legend className="visuallyHidden">
          <h4>Required Fields</h4>
        </legend>
        <EditableInput
          elementType="input"
          type="text"
          disabled={disabled}
          readOnly={disabled}
          required={true}
          name="name"
          ref="name"
          label="Name"
          value={this.props.item && this.props.item.name}
          error={this.props.error}
        />
        <EditableInput
          elementType="select"
          disabled={disabled}
          readOnly={disabled || !!(this.props.item && this.props.item.protocol)}
          name="protocol"
          label="Protocol"
          value={this.state.protocol}
          ref="protocol"
          onChange={this.handleProtocolChange}
          description={
            !this.protocolInstructions(protocol) &&
            this.protocolDescription(protocol)
          }
        >
          {this.availableProtocols().map((protocol) => (
            <option
              key={protocol.name}
              value={protocol.name}
              aria-selected={this.state.protocol === protocol.name}
            >
              {protocol.label || protocol.name}
            </option>
          ))}
        </EditableInput>
        {this.props.data &&
          this.allowsParent(protocol) &&
          this.availableParents().length > 0 && (
            <EditableInput
              elementType="select"
              readOnly={disabled}
              disabled={disabled}
              name="parent_id"
              label="Parent"
              value={this.state.parentId}
              ref="parent"
              onChange={this.handleParentChange}
            >
              <option value="" aria-selected={this.state.parentId === ""}>
                None
              </option>
              {this.availableParents().map((parent) => (
                <option
                  key={parent.id}
                  value={parent.id}
                  aria-selected={this.state.parentId === parent.id}
                >
                  {parent.name || parent.id}
                </option>
              ))}
            </EditableInput>
          )}
        {requiredFields.map((setting) => (
          <ProtocolFormField
            key={setting.key}
            ref={setting.key}
            setting={setting}
            readOnly={disabled}
            disabled={disabled}
            value={
              this.props.item &&
              this.props.item.settings &&
              this.props.item.settings[setting.key]
            }
            error={this.props.error}
          />
        ))}
      </fieldset>
    );
  }

  renderOptionalFields(optionalFields, disabled: boolean) {
    return (
      <fieldset>
        <legend className="visuallyHidden">Additional Fields</legend>
        {optionalFields.map((setting) => (
          <ProtocolFormField
            key={setting.key}
            ref={setting.key}
            setting={setting}
            readOnly={disabled}
            disabled={disabled}
            value={
              this.props.item &&
              this.props.item.settings &&
              this.props.item.settings[setting.key]
            }
            error={this.props.error}
          />
        ))}
      </fieldset>
    );
  }

  renderLibrariesForm(protocol: ProtocolData, disabled: boolean) {
    return (
      <fieldset className="update-libraries">
        <legend className="visuallyHidden">Libraries</legend>
        <div className="form-group">
          {this.state.libraries.map((library) => (
            <div key={library.short_name}>
              <WithRemoveButton
                disabled={disabled}
                onRemove={() => this.removeLibrary(library)}
                ref={library.short_name}
              >
                {this.props.data &&
                  this.props.data.protocols &&
                  this.protocolLibrarySettings(protocol) &&
                  this.protocolLibrarySettings(protocol).length > 0 && (
                    <WithEditButton
                      disabled={disabled}
                      onEdit={() => this.expandLibrary(library)}
                    >
                      {this.getLibrary(library.short_name) &&
                        this.getLibrary(library.short_name).name}
                    </WithEditButton>
                  )}
                {!(
                  this.props.data &&
                  this.props.data.protocols &&
                  this.protocolLibrarySettings(protocol) &&
                  this.protocolLibrarySettings(protocol).length > 0
                ) &&
                  this.getLibrary(library.short_name) &&
                  this.getLibrary(library.short_name).name}
              </WithRemoveButton>
              {this.isExpanded(library) && (
                <div className="edit-library-settings">
                  {this.props.data &&
                    this.props.data.protocols &&
                    this.protocolLibrarySettings(protocol) &&
                    this.protocolLibrarySettings(protocol).map((setting) => (
                      <ProtocolFormField
                        key={setting.key}
                        setting={setting}
                        disabled={disabled}
                        value={library[setting.key]}
                        ref={library.short_name + "_" + setting.key}
                      />
                    ))}
                  <Button
                    type="button"
                    className="edit-library"
                    disabled={disabled}
                    callback={() => this.editLibrary(library, protocol)}
                    content="Save"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {this.availableLibraries().length > 0 && (
          <div className="form-group">
            <EditableInput
              elementType="select"
              disabled={disabled}
              readOnly={disabled}
              name="add-library"
              label="Add Library"
              ref="addLibrary"
              value={this.state.selectedLibrary}
              onChange={this.selectLibrary}
            >
              <option
                value="none"
                aria-selected={this.state.selectedLibrary === "none"}
              >
                Select a library
              </option>
              {this.availableLibraries().map((library) => (
                <option
                  key={library.short_name}
                  value={library.short_name}
                  aria-selected={
                    this.state.selectedLibrary === "library.short_name"
                  }
                >
                  {library.name}
                </option>
              ))}
            </EditableInput>
            {this.state.selectedLibrary && (
              <div>
                {this.props.data &&
                  this.props.data.protocols &&
                  this.protocolLibrarySettings(protocol) &&
                  this.protocolLibrarySettings(protocol).map((setting) => (
                    <ProtocolFormField
                      key={setting.key}
                      setting={setting}
                      disabled={disabled}
                      readOnly={disabled}
                      ref={setting.key}
                    />
                  ))}
                <Button
                  type="button"
                  disabled={disabled}
                  callback={() => this.addLibrary(protocol)}
                  content="Add Library"
                  className="left-align"
                />
              </div>
            )}
          </div>
        )}
      </fieldset>
    );
  }

  availableProtocols(props?): ProtocolData[] {
    props = props || this.props;
    const allProtocols = (props.data && props.data.protocols) || [];

    // If we're editing an existing service, the protocol can't be changed,
    // so there's only one available protocol.
    if (props.item) {
      for (const protocol of allProtocols) {
        if (protocol.name === props.item.protocol) {
          return [protocol];
        }
      }
    }

    return allProtocols;
  }

  handleProtocolChange() {
    const protocol = (this.refs["protocol"] as any).getValue();
    const newState = Object.assign({}, this.state, { protocol });
    this.setState(newState);
  }

  allowsParent(protocol: ProtocolData): boolean {
    return protocol && !!protocol.child_settings;
  }

  availableParents() {
    const allServices =
      (this.props.data && this.props.data[this.props.listDataKey]) || [];
    const availableParents = [];
    for (const service of allServices) {
      if (
        service.protocol === this.state.protocol &&
        service.id !== (this.props.item && this.props.item.id)
      ) {
        availableParents.push(service);
      }
    }
    return availableParents;
  }

  handleParentChange() {
    let parentId = (this.refs["parent"] as any).getValue();
    if (parentId === "") {
      parentId = null;
    }
    const newState = Object.assign({}, this.state, { parentId });
    this.setState(newState);
  }

  protocols(): ProtocolData[] {
    return this.state.protocol && this.props.data && this.props.data.protocols;
  }

  findProtocol(): ProtocolData {
    return (
      this.protocols() &&
      this.protocols().find((p) => p.name === this.state.protocol)
    );
  }

  protocolSettings(protocol: ProtocolData) {
    const requiredFields = [];
    const nonRequiredFields = [];
    const extraFields = [];
    const extraSettings = [this.props.extraFormKey];
    let settings;
    if (protocol) {
      settings = this.state.parentId
        ? protocol.child_settings
        : protocol.settings;
      settings &&
        settings.forEach((s) => {
          extraSettings.includes(s.key)
            ? extraFields.push(s)
            : s.required
            ? requiredFields.push(s)
            : nonRequiredFields.push(s);
        });
    }
    return { requiredFields, nonRequiredFields, extraFields };
  }

  protocolDescription(protocol: ProtocolData) {
    return (protocol && protocol.description) || "";
  }

  protocolInstructions(protocol: ProtocolData) {
    return (protocol && protocol.instructions) || "";
  }

  protocolLibrarySettings(protocol: ProtocolData) {
    return (protocol && protocol.library_settings) || [];
  }

  sitewide(protocol: ProtocolData): boolean {
    return protocol && protocol.sitewide;
  }

  getLibrary(shortName: string): LibraryData {
    const libraries = (this.props.data && this.props.data.allLibraries) || [];
    for (const library of libraries) {
      if (library.short_name === shortName) {
        return library;
      }
    }
    return null;
  }

  availableLibraries(): LibraryData[] {
    const libraries = (this.props.data && this.props.data.allLibraries) || [];
    return libraries.filter((library) => {
      for (const stateLibrary of this.state.libraries) {
        if (stateLibrary.short_name === library.short_name) {
          return false;
        }
      }
      return true;
    });
  }

  selectLibrary() {
    let name = (this.refs["addLibrary"] as any).getValue();
    if (name === "none") {
      name = null;
    }
    const newState = Object.assign({}, this.state, { selectedLibrary: name });
    this.setState(newState);
  }

  isExpanded(library) {
    return this.state.expandedLibraries.indexOf(library.short_name) !== -1;
  }

  removeLibrary(library) {
    const libraries = this.state.libraries.filter(
      (stateLibrary) => stateLibrary.short_name !== library.short_name
    );
    const expandedLibraries = this.state.expandedLibraries.filter(
      (shortName) => shortName !== library.short_name
    );
    const newState = Object.assign({}, this.state, {
      libraries,
      expandedLibraries,
    });
    this.setState(newState);
  }

  expandLibrary(library) {
    if (!this.isExpanded(library)) {
      const expandedLibraries = this.state.expandedLibraries;
      expandedLibraries.push(library.short_name);
      const newState = Object.assign({}, this.state, { expandedLibraries });
      this.setState(newState);
    } else {
      const expandedLibraries = this.state.expandedLibraries.filter(
        (shortName) => shortName !== library.short_name
      );
      const newState = Object.assign({}, this.state, { expandedLibraries });
      this.setState(newState);
    }
  }

  editLibrary(library, protocol: ProtocolData) {
    const libraries = this.state.libraries.filter(
      (stateLibrary) => stateLibrary.short_name !== library.short_name
    );
    const expandedLibraries = this.state.expandedLibraries.filter(
      (shortName) => shortName !== library.short_name
    );
    const newLibrary = { short_name: library.short_name };
    for (const setting of this.protocolLibrarySettings(protocol)) {
      const value = (this.refs[
        library.short_name + "_" + setting.key
      ] as any).getValue();
      if (value) {
        newLibrary[setting.key] = value;
      }
    }
    libraries.push(newLibrary);
    const newState = Object.assign({}, this.state, {
      libraries,
      expandedLibraries,
    });
    this.setState(newState);
  }

  addLibrary(protocol: ProtocolData) {
    const name = this.state.selectedLibrary;
    const newLibrary = { short_name: name };
    for (const setting of this.protocolLibrarySettings(protocol)) {
      const value = (this.refs[setting.key] as any).getValue();
      if (value) {
        newLibrary[setting.key] = value;
      }
      (this.refs[setting.key] as any).clear();
    }
    const libraries = this.state.libraries.concat(newLibrary);
    const newState = Object.assign({}, this.state, {
      libraries,
      selectedLibrary: null,
    });
    this.setState(newState);
  }

  handleData(data: FormData) {
    const extraFormRef = this.extraForm.current;
    extraFormRef &&
      data.append(this.props.extraFormKey, (extraFormRef as any).getValue());
    data && data.append("libraries", JSON.stringify(this.state.libraries));
    return data;
  }

  async submit(data: FormData) {
    if (this.props.save) {
      const modifiedData = this.handleData(data);
      await this.props.save(modifiedData);
    }
  }
}
