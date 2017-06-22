import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { LibraryWithSettingsData, PatronAuthServicesData, PatronAuthServiceData, ProtocolData } from "../interfaces";

export interface PatronAuthServiceEditFormProps {
  data: PatronAuthServicesData;
  item?: PatronAuthServiceData;
  csrfToken: string;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
}

export interface PatronAuthServiceEditFormState {
  protocol: string;
  libraries: LibraryWithSettingsData[];
}

export default class PatronAuthServiceEditForm extends React.Component<PatronAuthServiceEditFormProps, PatronAuthServiceEditFormState> {
  constructor(props) {
    super(props);
    let defaultProtocol;
    if (this.availableProtocols().length) {
      defaultProtocol = this.availableProtocols()[0].name;
    }
    this.state = {
      protocol: (this.props.item && this.props.item.protocol) || defaultProtocol,
      libraries: (this.props.item && this.props.item.libraries) || []
    };
    this.handleProtocolChange = this.handleProtocolChange.bind(this);
    this.addLibrary = this.addLibrary.bind(this);
    this.removeLibrary = this.removeLibrary.bind(this);
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.save} className="edit-form">
        <input
          type="hidden"
          name="csrf_token"
          value={this.props.csrfToken}
          />
        { this.props.item &&
          <input
            type="hidden"
            name="id"
            value={String(this.props.item.id)}
            />
        }
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          readOnly={!!(this.props.item && this.props.item.protocol)}
          name="protocol"
          label="Protocol"
          value={this.state.protocol}
          ref="protocol"
          onChange={this.handleProtocolChange}
          >
          { this.availableProtocols().map(protocol =>
              <option key={protocol.name} value={protocol.name}>{protocol.label || protocol.name}</option>
            )
          }
        </EditableInput>
        { this.protocolDescription() &&
          <p>{ this.protocolDescription() }</p>
        }
        { this.props.data && this.props.data.protocols && this.protocolSettings() && this.protocolSettings().map(setting =>
            <ProtocolFormField
              setting={setting}
              disabled={this.props.disabled}
              value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
              />
          )
        }
        <div class="form-group">
          <label>Libraries</label>
          { this.state.libraries.map(library =>
              <div key={library.short_name} className="patron-auth-service-library">
                <div>{library.short_name}</div>
                <i
                  className="fa fa-times"
                  aria-hidden="true"
                  onClick={() => !this.props.disabled && this.removeLibrary(library)}
                  ></i>
                <a
                  className="sr-only"
                  onClick={() => !this.props.disabled && this.removeLibrary(library)}
                  >remove</a>
              </div>
            )
          }
        </div>
        { this.availableLibraries().length > 0 &&
          <div className="form-group">
            <select
              disabled={this.props.disabled}
              name="add-library"
              label="Add Library"
              ref="addLibrary"
              >
              { this.availableLibraries().map(library =>
                  <option key={library} value={library}>{library}</option>
                )
              }
            </select>
           { this.props.data && this.props.data.protocols && this.protocolLibrarySettings() && this.protocolLibrarySettings().map(setting =>
                <ProtocolFormField
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
    let libraries = this.state.libraries;
    if (newProps.item && newProps.item.protocol) {
      if (!this.props.item || !this.props.item.protocol || (this.props.item.protocol !== newProps.item.protocol)) {
        protocol = newProps.item.protocol;
      }
    }
    if (newProps.item && newProps.item.libraries) {
      if (!this.props.item || !this.props.item.libraries || (this.props.item.libraries !== newProps.item.libraries)) {
        libraries = newProps.item.libraries;
      }
    }
    this.setState({ protocol, libraries });
  }

  save(event) {
    event.preventDefault();

    const data = new (window as any).FormData(this.refs["form"] as any);
    data.append("libraries", JSON.stringify(this.state.libraries));
    this.props.editItem(data).then(() => {
      // If a new patron auth service was created, go back to the list of patron auth services.
      if (!this.props.item) {
        window.location.href = "/admin/web/config/patronAuth";
      }
    });
  }

  availableProtocols(): ProtocolData[] {
    const allProtocols = this.props.data && this.props.data.protocols || [];

    // If we're editing an existing service, the protocol can't be changed,
    // so there's only one available protocol.
    if (this.props.item) {
      for (const protocol of allProtocols) {
        if (protocol.name === this.props.item.protocol) {
          return [protocol];
        }
      }
    }

    return allProtocols;
  }

  handleProtocolChange() {
    const protocol = (this.refs["protocol"] as any).getValue();
    this.setState({ protocol, libraries: this.state.libraries });
  }

  protocolSettings() {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.settings;
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

  availableLibraries(): string[] {
    const names = (this.props.data.allLibraries || []).map(library => library.short_name);
    return names.filter(name => {
      for (const library of this.state.libraries) {
        if (library.short_name === name) {
          return false;
        }
      }
      return true;
    });
  }

  removeLibrary(library) {
    const libraries = this.state.libraries.filter(stateLibrary => stateLibrary.short_name !== library.short_name);
    this.setState({ protocol: this.state.protocol, libraries });
  }

  addLibrary() {
    const name = (this.refs["addLibrary"] as any).value;
    const newLibrary = { short_name: name };
    for (const setting of this.protocolLibrarySettings()) {
      const value = (this.refs[setting.key] as any).getValue();
      if (value) {
        newLibrary[setting.key] = value;
      }
    }
    const libraries = this.state.libraries.concat(newLibrary);
    this.setState({ protocol: this.state.protocol, libraries });
  }
}