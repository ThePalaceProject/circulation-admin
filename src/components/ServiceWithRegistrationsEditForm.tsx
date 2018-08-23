import * as React from "react";
import ServiceEditForm from "./ServiceEditForm";
import EditableInput from "./EditableInput";
import { ServicesWithRegistrationsData } from "../interfaces";

/** Form for editing discovery services on the discovery service configuration tab.
    Includes the same form as other services but an addition section with a list
    of libraries and their registration statuses and buttons to register them. */
export default class ServiceWithRegistrationsEditForm<T extends ServicesWithRegistrationsData> extends ServiceEditForm<T> {
  context: { registerLibrary: (library) => void };

  static contextTypes = {
    registerLibrary: React.PropTypes.func
  };

  render(): JSX.Element {
    return (
      <div>
        {super.render()}
        { this.props.item && this.protocolSupportsRegistration() && this.props.data && this.props.data.allLibraries && this.props.data.allLibraries.length > 0 &&
          <div>
            <h2>Register libraries</h2>
            { this.props.data.allLibraries.map(library => {
                const registryStage = this.getStageStatus(library);
                return (
                  <div className="service-with-registrations-library" key={library.short_name}>
                    { library.name }
                    <EditableInput
                      elementType="select"
                      disabled={registryStage === "production"}
                      readOnly={registryStage === "production"}
                      name="registryStage"
                      label="Stage"
                      value={registryStage}
                      ref="protocol"
                      onChange={this.handleProtocolChange}
                    >
                      <option value="testing">Testing</option>
                      <option value="production">Production</option>
                    </EditableInput>
                    { this.getRegistrationStatus(library) === "success" &&
                      <div>
                        <span className="bg-success">
                          Registered
                        </span>
                        <button
                          type="button"
                          className="btn btn-default"
                          disabled={this.props.disabled}
                          onClick={() => this.context.registerLibrary(library)}
                          >Update registration</button>
                      </div>
                    }
                    { this.getRegistrationStatus(library) === "failure" &&
                      <div>
                        <span className="bg-danger">
                          Registration failed
                        </span>
                        <button
                          type="button"
                          className="btn btn-default"
                          disabled={this.props.disabled}
                          onClick={() => this.context.registerLibrary(library)}
                          >Retry registration</button>
                      </div>
                    }
                    { this.getRegistrationStatus(library) === null &&
                      <div>
                        <span className="bg-warning">
                          Not registered
                        </span>
                        <button
                          type="button"
                          className="btn btn-default"
                          disabled={this.props.disabled}
                          onClick={() => this.context.registerLibrary(library)}
                          >Register</button>
                      </div>
                    }
                  </div>);
                }
              )
            }
          </div>
        }
      </div>
    );
  }

  getRegistrationStatus(library): string | null {
    const serviceId = this.props.item && this.props.item.id;
    const libraryRegistrations = this.props.data && this.props.data.libraryRegistrations || [];
    for (const serviceInfo of libraryRegistrations) {
      if (serviceInfo.id === serviceId) {
        for (const libraryInfo of serviceInfo.libraries) {
          if (libraryInfo.short_name === library.short_name) {
            return libraryInfo.status;
          }
        }
      }
    }
    return null;
  }

  getStageStatus(library): string | null {
    const serviceId = this.props.item && this.props.item.id;
    const libraryRegistrations = this.props.data && this.props.data.libraryRegistrations || [];
    for (const serviceInfo of libraryRegistrations) {
      if (serviceInfo.id === serviceId) {
        for (const libraryInfo of serviceInfo.libraries) {
          if (libraryInfo.short_name === library.short_name) {
            return libraryInfo.stage;
          }
        }
      }
    }
    return null;
  }

  protocolSupportsRegistration(): boolean {
    if (this.state.protocol && this.props.data.protocols) {
      for (const protocol of this.props.data.protocols) {
        if (protocol.name === this.state.protocol) {
          return !!protocol.supports_registration;
        }
      }
    }
    return false;
  }
}
