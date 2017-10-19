import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import WithEditButton from "./WithEditButton";
import WithRemoveButton from "./WithRemoveButton";
import { LibraryData, LibraryWithSettingsData, ProtocolData, ServiceData, ServicesData } from "../interfaces";
import { EditFormProps } from "./EditableConfigList";

export interface ServiceEditFormProps<T> {
  data: T;
  item?: ServiceData;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
}

export interface ServiceEditFormState {
  protocol: string;
  parentId: string | null;
  libraries: LibraryWithSettingsData[];
  expandedLibraries: string[];
  selectedLibrary: string | null;
}

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
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.save} className="edit-form">
        { this.props.item && this.props.item.id &&
          <input
            type="hidden"
            name="id"
            value={String(this.props.item.id)}
            />
        }
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="name"
          label="Name"
          value={this.props.item && this.props.item.name}
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
          description={this.protocolDescription() }
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
        { this.props.data && this.props.data.protocols && this.protocolSettings() && this.protocolSettings().map(setting =>
            <ProtocolFormField
              key={setting.key}
              setting={setting}
              disabled={this.props.disabled}
              value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
              />
          )
        }
        { !this.sitewide() &&
          <div className="form-group">
            <label>Libraries</label>
            { this.state.libraries.map(library =>
                <div key={library.short_name}>
                  <WithRemoveButton
                    disabled={this.props.disabled}
                    onRemove={() => this.removeLibrary(library)}
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
        }
        { !this.sitewide() && this.availableLibraries().length > 0 &&
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
        <button
          className="btn btn-default"
          disabled={this.props.disabled}
          type="submit">
          Submit
        </button>
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
    if (this.state.protocol && this.props.data.protocols) {
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
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          if (this.state.parentId) {
            return protocol.child_settings;
          } else {
            return protocol.settings;
          }
        }
      }
    }
    return [];
  }

  protocolDescription() {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.description;
        }
      }
    }
    return "";
  }

  protocolLibrarySettings() {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.library_settings || [];
        }
      }
    }
    return [];
  }

  sitewide() {
    if (this.state.protocol && this.props.data.protocols) {
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

  save(event) {
    event.preventDefault();

    const data = new (window as any).FormData(this.refs["form"] as any);
    data.append("libraries", JSON.stringify(this.state.libraries));
    this.props.editItem(data).then(() => {
      // If a new service was created, go back to the list of services.
      if (!this.props.item) {
        window.location.href = this.props.urlBase;
      }
    });
  }
}