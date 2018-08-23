import * as React from "react";
import ServiceEditForm from "./ServiceEditForm";
import EditableInput from "./EditableInput";
import { ServicesWithRegistrationsData, LibraryDataWithStatus } from "../interfaces";

/** Form for editing discovery services on the discovery service configuration tab.
    Includes the same form as other services but an addition section with a list
    of libraries and their registration statuses and buttons to register them. */
export default class ServiceWithRegistrationsEditForm<T extends ServicesWithRegistrationsData> extends ServiceEditForm<T> {
  context: { registerLibrary: (library, registration_stage) => void };

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
                const setRegistryStage = this.getLibraryProp(library, "stage") || "testing";
                const registration_stage =
                  (this.state.registration_stage && this.state.registration_stage[library.short_name]) || "testing";

                return (
                  <div className="service-with-registrations-library" key={library.short_name}>
                    <div className="library-name">{ library.name }</div>
                    <div className="library-registration-info">
                      <div className="current-stage">
                        <span>Current Stage: {setRegistryStage}</span>
                        { setRegistryStage !== "production" &&
                          <EditableInput
                            elementType="select"
                            name="registration_stage"
                            label="Stage"
                            value={setRegistryStage || "testing"}
                            ref={`stage-${library.short_name}`}
                            onChange={() => this.updateRegistrationStage(library)}
                          >
                            <option value="testing">Testing</option>
                            <option value="production">Production</option>
                          </EditableInput>
                        }
                      </div>

                      { this.getLibraryProp(library, "status") === "success" &&
                        <div>
                          <span className="bg-success">
                            Registered
                          </span>
                          <button
                            type="button"
                            className="btn btn-default"
                            disabled={this.props.disabled}
                            onClick={() => this.context.registerLibrary(library, registration_stage)}
                            >Update registration</button>
                        </div>
                      }
                      { this.getLibraryProp(library, "status") === "failure" &&
                        <div>
                          <span className="bg-danger">
                            Registration failed
                          </span>
                          <button
                            type="button"
                            className="btn btn-default"
                            disabled={this.props.disabled}
                            onClick={() => this.context.registerLibrary(library, registration_stage)}
                            >Retry registration</button>
                        </div>
                      }
                      { this.getLibraryProp(library, "status") === null &&
                        <div>
                          <span className="bg-warning">
                            Not registered
                          </span>
                          <button
                            type="button"
                            className="btn btn-default"
                            disabled={this.props.disabled}
                            onClick={() => this.context.registerLibrary(library, registration_stage)}
                            >Register</button>
                        </div>
                      }
                    </div>
                  </div>);
                }
              )
            }
          </div>
        }
      </div>
    );
  }

  updateRegistrationStage(library) {
    const registration_stage = (this.refs[`stage-${library.short_name}`] as any).getValue();
    this.setState({
      protocol: this.state.protocol,
      parentId: this.state.parentId,
      libraries: this.state.libraries,
      expandedLibraries: this.state.expandedLibraries,
      selectedLibrary: this.state.selectedLibrary,
      registration_stage: Object.assign(
        {}, this.state.registration_stage, { [library.short_name]: registration_stage }
      ),
    });
  }

  getLibraryInfo(library): LibraryDataWithStatus | null {
    const serviceId = this.props.item && this.props.item.id;
    const libraryRegistrations = this.props.data && this.props.data.libraryRegistrations || [];
    for (const serviceInfo of libraryRegistrations) {
      if (serviceInfo.id === serviceId) {
        for (const libraryInfo of serviceInfo.libraries) {
          if (libraryInfo.short_name === library.short_name) {
            return libraryInfo;
          }
        }
      }
    }
    return null;
  }

  getLibraryProp(library, prop): string | null {
    const libraryInfo = this.getLibraryInfo(library);
    return libraryInfo && libraryInfo[prop];
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
