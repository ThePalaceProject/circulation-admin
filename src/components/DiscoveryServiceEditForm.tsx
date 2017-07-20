import * as React from "react";
import ServiceEditForm from "./ServiceEditForm";
import { DiscoveryServicesData } from "../interfaces";

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
                  <button
                    type="button"
                    className="btn btn-default"
                    disabled={this.props.disabled}
                    onClick={() => this.context.registerLibrary(library)}
                    >Register</button>
                  {library.name}
                </div>
              )
            }
          </div>
        }
      </div>
    );
  }
}