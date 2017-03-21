import * as React from "react";
import EditableInput from "./EditableInput";
import { CollectionData, LibraryData, ProtocolData } from "../interfaces";

export interface CollectionEditFormProps {
  collection?: CollectionData;
  csrfToken: string;
  disabled: boolean;
  protocols: ProtocolData[];
  allLibraries: LibraryData[];
  editCollection: (data: FormData) => Promise<any>;
}

export default class CollectionEditForm extends React.Component<CollectionEditFormProps, any> {
  constructor(props) {
    super(props);
    let defaultProtocol;
    if (this.props.protocols && this.props.protocols.length) {
       defaultProtocol = this.props.protocols[0].name;
    }
    this.state = {
      protocol: (this.props.collection && this.props.collection.protocol) || defaultProtocol,
      libraries: (this.props.collection && this.props.collection.libraries) || []
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
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          readOnly={!!(this.props.collection && this.props.collection.name)}
          name="name"
          label="Name"
          value={this.props.collection && this.props.collection.name}
          />
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          readOnly={!!(this.props.collection && this.props.collection.protocol)}
          name="protocol"
          label="Protocol"
          value={this.state.protocol}
          ref="protocol"
          onChange={this.handleProtocolChange}
          >
          { this.props.protocols && this.props.protocols.length > 0 && this.props.protocols.map(protocol =>
              <option key={protocol.name} value={protocol.name}>{protocol.name}</option>
            )
          }
        </EditableInput>
        { this.props.protocols && this.protocolFields() && this.protocolFields().map(field =>
            <EditableInput
              key={field.key}
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name={field.key}
              label={field.label}
              value={this.props.collection && this.props.collection[field.key]}
              />
          )
        }
        <div className="form-group">
          <label>Libraries</label>
          { this.state.libraries.map(library =>
              <div key={library} className="collection-library">
                <div>{library}</div>
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
    if (newProps.collection && newProps.collection.protocol) {
      if (!this.props.collection || !this.props.collection.protocol || (this.props.collection.protocol !== newProps.collection.protocol)) {
        this.setState({ protocol: newProps.collection.protocol });
      }
    }
    if (newProps.collection && newProps.collection.libraries) {
      if (!this.props.collection || !this.props.collection.libraries || (this.props.collection.libraries !== newProps.collection.libraries)) {
        this.setState({ libraries: newProps.collection.libraries });
      }
    }
  }

  save(event) {
    event.preventDefault();

    const data = new (window as any).FormData(this.refs["form"] as any);
    data.append("libraries", JSON.stringify(this.state.libraries));
    this.props.editCollection(data).then(() => {
      // If a new collection was created, go to its edit page.
      if (!this.props.collection && data.get("name")) {
        window.location.href = "/admin/web/config/collections/edit/" + data.get("name");
      }
    });
  }

  handleProtocolChange() {
    const protocol = (this.refs["protocol"] as any).getValue();
    this.setState({ protocol });
  }

  protocolFields() {
    if (this.state.protocol && this.props.protocols) {
      for (const protocol of this.props.protocols) {
        if (protocol.name === this.state.protocol) {
          return protocol.fields;
        }
      }
    }
    return [];
  }

  availableLibraries(): string[] {
    const names = (this.props.allLibraries || []).map(library => library.short_name);
    return names.filter(name => this.state.libraries.indexOf(name) === -1);
  }

  removeLibrary(library: string) {
    this.setState({ libraries: this.state.libraries.filter(stateLibrary => stateLibrary !== library) });
  }

  addLibrary() {
    const library = (this.refs["addLibrary"] as any).value;
    if (this.state.libraries.indexOf(library !== -1)) {
      this.setState({ libraries: this.state.libraries.concat([library]) });
    }
  }
}