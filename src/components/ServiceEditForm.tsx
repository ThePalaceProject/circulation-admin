import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import SaveButton from "./SaveButton";
import Collapsible from "./Collapsible";
import WithEditButton from "./WithEditButton";
import WithRemoveButton from "./WithRemoveButton";
import { LibraryData, LibraryWithSettingsData, ProtocolData, ServiceData, ServicesData } from "../interfaces";
import { EditFormProps } from "./EditableConfigList";
import { handleSubmit, clearForm } from "./sharedFunctions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface ServiceEditFormProps<T> {
  data: T;
  item?: ServiceData;
  disabled: boolean;
  save: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
  error?: FetchErrorData;
}

export interface ServiceEditFormState {
  protocol: string;
  parentId: string | null;
  libraries: LibraryWithSettingsData[];
  expandedLibraries: string[];
  selectedLibrary: string | null;
}

/** Form for editing service configuration based on protocol information from the server.
    Used on most tabs on the system configuration page. */
export default class ServiceEditForm<T extends ServicesData> extends React.Component<ServiceEditFormProps<T>, ServiceEditFormState> {
  constructor(props) {
    super(props);
    let defaultProtocol;
    if (this.availableProtocols().length) {
      defaultProtocol = this.availableProtocols()[0].name;
    }
    this.state = {
      protocol: (this.props.item && this.props.item.protocol) || defaultProtocol,
      parentId: (this.props.item && this.props.item.parent_id && String(this.props.item.parent_id)) || null,
      libraries: (this.props.item && this.props.item.libraries) || [],
      expandedLibraries: [],
      selectedLibrary: null
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

  renderRequiredFields(requiredFields) {
    return (
      <fieldset>
        <legend className="visuallyHidden"><h4>Required Fields</h4></legend>
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          required={true}
          name="name"
          ref="name"
          label="Name"
          value={this.props.item && this.props.item.name}
          error={this.props.error}
          />
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          readOnly={!!(this.props.item && this.props.item.protocol)}
          name="protocol"
          label="Protocol"
          value={this.state.protocol}
          ref="protocol"
          onChange={this.handleProtocolChange}
          description={!this.protocolInstructions() && this.protocolDescription()}
          >
          { this.availableProtocols().map(protocol =>
              <option key={protocol.name} value={protocol.name}>{protocol.label || protocol.name}</option>
            )
          }
        </EditableInput>
        { this.props.data && this.allowsParent() && (this.availableParents().length > 0) &&
          <EditableInput
            elementType="select"
            disabled={this.props.disabled}
            name="parent_id"
            label="Parent"
            value={this.state.parentId}
            ref="parent"
            onChange={this.handleParentChange}
            >
            <option value="">None</option>
            { this.availableParents().map(parent =>
                <option key={parent.id} value={parent.id}>{parent.name || parent.id}</option>
              )
            }
          </EditableInput>
        }
        { requiredFields.map(setting =>
            <ProtocolFormField
              key={setting.key}
              ref={setting.key}
              setting={setting}
              disabled={this.props.disabled}
              value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
              error={this.props.error}
              />
          )
        }
      </fieldset>
    );
  }

  renderOptionalFields(optionalFields) {
    return (
      <fieldset>
        <legend className="visuallyHidden">Additional Fields</legend>
        { optionalFields.map(setting =>
            <ProtocolFormField
              key={setting.key}
              ref={setting.key}
              setting={setting}
              disabled={this.props.disabled}
              value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
              error={this.props.error}
              />
          )
        }
      </fieldset>
    );
  }

  renderLibrariesForm() {
    return (
      <fieldset>
        <legend className="visuallyHidden">Libraries</legend>
        <div className="form-group">
          { this.state.libraries.map(library =>
              <div key={library.short_name}>
                <WithRemoveButton
                  disabled={this.props.disabled}
                  onRemove={() => this.removeLibrary(library)}
                  ref={library.short_name}
                  >
                  { this.props.data && this.props.data.protocols && this.protocolLibrarySettings() && this.protocolLibrarySettings().length > 0 &&
                    <WithEditButton
                      disabled={this.props.disabled}
                      onEdit={() => this.expandLibrary(library)}
                      >
                      {this.getLibrary(library.short_name) && this.getLibrary(library.short_name).name}
                    </WithEditButton>
                  }
                  { !(this.props.data && this.props.data.protocols && this.protocolLibrarySettings() && this.protocolLibrarySettings().length > 0) &&
                    this.getLibrary(library.short_name) && this.getLibrary(library.short_name).name
                  }
                </WithRemoveButton>
                { this.isExpanded(library) &&
                  <div className="edit-library-settings">
                    { this.props.data && this.props.data.protocols && this.protocolLibrarySettings() && this.protocolLibrarySettings().map(setting =>
                      <ProtocolFormField
                        key={setting.key}
                        setting={setting}
                        disabled={this.props.disabled}
                        value={library[setting.key]}
                        ref={library.short_name + "_" + setting.key}
                        />
                      )
                    }
                    <button
                      type="button"
                      className="btn btn-default edit-library"
                      disabled={this.props.disabled}
                      onClick={() => this.editLibrary(library)}
                      >Save</button>
                  </div>
                }
              </div>
            )
          }
        </div>
        { (this.availableLibraries().length > 0) &&
            <div className="form-group">
              <EditableInput
                elementType="select"
                disabled={this.props.disabled}
                name="add-library"
                label="Add Library"
                ref="addLibrary"
                value={this.state.selectedLibrary}
                onChange={this.selectLibrary}
                >
                <option value="none">Select a library</option>
                { this.availableLibraries().map(library =>
                    <option key={library.short_name} value={library.short_name}>{library.name}</option>
                  )
                }
              </EditableInput>
              { this.state.selectedLibrary &&
                <div>
                  { this.props.data && this.props.data.protocols && this.protocolLibrarySettings() && this.protocolLibrarySettings().map(setting =>
                      <ProtocolFormField
                        key={setting.key}
                        setting={setting}
                        disabled={this.props.disabled}
                        ref={setting.key}
                        />
                    )
                  }
                  <button
                    type="button"
                    className="btn btn-default add-library"
                    disabled={this.props.disabled}
                    onClick={this.addLibrary}
                    >Add Library</button>
                </div>
              }
            </div>
        }
      </fieldset>
    );
  }

  render(): JSX.Element {
    const { requiredFields, nonRequiredFields } = this.protocolSettings();
    const showLibrariesForm = (!this.sitewide() || this.protocolLibrarySettings().length > 0);
    const hasNonRequiredFields = nonRequiredFields.length > 0;
    return (
      <form ref="form" onSubmit={this.submit} className="edit-form">
        { this.props.item && this.props.item.id &&
          <input
            type="hidden"
            name="id"
            value={String(this.props.item.id)}
            />
        }
        { this.props.data && this.protocolInstructions() &&
            <div className="form-group">
              <label className="control-label">Instructions</label>
              <Collapsible
                title={this.protocolDescription()}
                type="instruction"
                text={this.protocolInstructions()}
              />
            </div>
        }
        <Collapsible
          title="Required Fields"
          openByDefault={true}
          collapsible={hasNonRequiredFields || showLibrariesForm}
          body={this.renderRequiredFields(requiredFields)}
        />
        { hasNonRequiredFields && (
          <Collapsible
            title="Optional Fields"
            body={this.renderOptionalFields(nonRequiredFields)}
          />)
        }
        { (showLibrariesForm) &&
          <Collapsible
            title="Libraries"
            body={this.renderLibrariesForm()}
          />
        }
        <SaveButton
          disabled={this.props.disabled}
          submit={this.submit}
          text="Submit"
          form={this.refs}
        />
      </form>
    );
  }

  componentWillReceiveProps(newProps) {
    let protocol = this.state.protocol;
    let parentId = this.state.parentId;
    let libraries = this.state.libraries;
    if (newProps.item && newProps.item.protocol) {
      if (!this.props.item || !this.props.item.protocol || (this.props.item.protocol !== newProps.item.protocol)) {
        protocol = newProps.item.protocol;
      }
    }
    if (!protocol && this.availableProtocols(newProps).length > 0) {
        protocol = this.availableProtocols(newProps)[0].name;
    }

    if (newProps.item && newProps.item.parent_id) {
      if (!this.props.item || !this.props.item.parent_id || (this.props.item.parent_id !== newProps.item.parent_id)) {
        parentId = newProps.item.parent_id;
      }
    }

    if (newProps.item && newProps.item.libraries) {
      if (!this.props.item || !this.props.item.libraries || (this.props.item.libraries !== newProps.item.libraries)) {
        libraries = newProps.item.libraries;
      }
    }
    const newState = Object.assign({}, this.state, { protocol, parentId, libraries });
    this.setState(newState);

    if (newProps.responseBody && !newProps.fetchError) {
      clearForm(this.refs);
    }

  }

  availableProtocols(props?): ProtocolData[] {
    props = props || this.props;
    const allProtocols = props.data && props.data.protocols || [];

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

  allowsParent(): boolean {
    if (this.state.protocol && this.props.data && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return !!protocol.child_settings;
        }
      }
    }
    return false;
  }

  availableParents() {
    const allServices = this.props.data && this.props.data[this.props.listDataKey] || [];
    const availableParents = [];
    for (const service of allServices) {
      if (service.protocol === this.state.protocol && service.id !== (this.props.item && this.props.item.id)) {
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

  protocolSettings() {
    let requiredFields = [];
    let nonRequiredFields = [];
    if (this.state.protocol && this.props.data && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          let settings = [];
          if (this.state.parentId) {
            settings = protocol.child_settings;
          } else {
            settings = protocol.settings;
          }
          nonRequiredFields = settings.filter(setting => !setting.required);
          requiredFields = settings.filter(setting => setting.required);
        }
      }
    }
    return {
      requiredFields,
      nonRequiredFields,
    };
  }

  protocolDescription() {
    if (this.state.protocol && this.props.data && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.description;
        }
      }
    }
    return "";
  }

  protocolInstructions() {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.instructions;
        }
      }
    }
    return "";
  }

  protocolLibrarySettings() {
    if (this.state.protocol && this.props.data && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.library_settings || [];
        }
      }
    }
    return [];
  }

  sitewide() {
    if (this.state.protocol && this.props.data && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.sitewide;
        }
      }
    }
    return false;
  }

  getLibrary(shortName: string): LibraryData {
    const libraries = this.props.data && this.props.data.allLibraries || [];
    for (const library of libraries) {
      if (library.short_name === shortName) {
        return library;
      }
    }
    return null;
  }

  availableLibraries(): LibraryData[] {
    const libraries = this.props.data && this.props.data.allLibraries || [];
    return libraries.filter(library => {
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
    const libraries = this.state.libraries.filter(stateLibrary => stateLibrary.short_name !== library.short_name);
    const expandedLibraries = this.state.expandedLibraries.filter(shortName => shortName !== library.short_name);
    const newState = Object.assign({}, this.state, { libraries, expandedLibraries });
    this.setState(newState);
  }

  expandLibrary(library) {
    if (!this.isExpanded(library)) {
      const expandedLibraries = this.state.expandedLibraries;
      expandedLibraries.push(library.short_name);
      const newState = Object.assign({}, this.state, { expandedLibraries });
      this.setState(newState);
    } else {
      const expandedLibraries = this.state.expandedLibraries.filter(shortName => shortName !== library.short_name);
      const newState = Object.assign({}, this.state, { expandedLibraries });
      this.setState(newState);
    }
  }

  editLibrary(library) {
    const libraries = this.state.libraries.filter(stateLibrary => stateLibrary.short_name !== library.short_name);
    const expandedLibraries = this.state.expandedLibraries.filter(shortName => shortName !== library.short_name);
    const newLibrary = { short_name: library.short_name };
    for (const setting of this.protocolLibrarySettings()) {
      const value = (this.refs[library.short_name + "_" + setting.key] as any).getValue();
      if (value) {
        newLibrary[setting.key] = value;
      }
    }
    libraries.push(newLibrary);
    const newState = Object.assign({}, this.state, { libraries, expandedLibraries });
    this.setState(newState);
  }

  addLibrary() {
    const name = this.state.selectedLibrary;
    const newLibrary = { short_name: name };
    for (const setting of this.protocolLibrarySettings()) {
      const value = (this.refs[setting.key] as any).getValue();
      if (value) {
        newLibrary[setting.key] = value;
      }
      (this.refs[setting.key] as any).clear();
    }
    const libraries = this.state.libraries.concat(newLibrary);
    const newState = Object.assign({}, this.state, { libraries, selectedLibrary: null });
    this.setState(newState);
  }

  handleData(data) {
    return data.append("libraries", JSON.stringify(this.state.libraries));
  }

  submit(event) {
    event.preventDefault();
    handleSubmit(this);
  }

}
