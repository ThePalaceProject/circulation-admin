import * as React from "react";
import ServiceEditForm from "./ServiceEditForm";
import { ServicesWithRegistrationsData } from "../interfaces";
import LibraryRegistration from "./LibraryRegistration";

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
        <LibraryRegistration
          registerLibrary={this.context.registerLibrary}
          protocol={this.state.protocol}
          item={this.props.item}
          data={this.props.data}
          disabled={this.props.disabled}
          save={this.props.save}
          urlBase={this.props.urlBase}
          listDataKey={this.props.listDataKey}
        />
      </div>
    );
  }
}
