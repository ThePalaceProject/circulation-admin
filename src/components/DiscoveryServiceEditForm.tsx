import * as React from "react";
import ServiceEditForm from "./ServiceEditForm";
import { DiscoveryServicesData } from "../interfaces";

/** Form for editing discovery services on the discovery service configuration tab.
    Includes the same form as other services but an addition section with a list
    of libraries and their registration statuses and buttons to register them. */
export default class DiscoveryServiceEditForm extends ServiceEditForm<DiscoveryServicesData> {
  context: { registerLibrary: (library) => void };

  static contextTypes = {
    registerLibrary: React.PropTypes.func
  };

  render(): JSX.Element {
    return (
      <div>
        {super.render()}
        { this.props.item && this.props.data && this.props.data.allLibraries && this.props.data.allLibraries.length > 0 &&
          <div>
            <h2>Register libraries</h2>
            { this.props.data.allLibraries.map(library =>
                <div className="discovery-service-library" key={library.short_name}>
                  { this.getRegistrationStatus(library) === "success" &&
                    <div>
                      { library.name }
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
                      { library.name }
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
                      { library.name }
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
                </div>
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
}