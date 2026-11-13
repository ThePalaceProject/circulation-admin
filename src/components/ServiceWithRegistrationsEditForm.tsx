import * as React from "react";
import ServiceEditForm, { ServiceEditFormProps } from "./ServiceEditForm";
import { LibraryData, ServicesWithRegistrationsData } from "../interfaces";
import LibraryRegistration from "./LibraryRegistration";

export interface ServiceWithRegistrationsEditFormProps<
  T,
> extends ServiceEditFormProps<T> {
  /** Registers a library with the service being edited. */
  registerLibrary: (library: LibraryData, registration_stage: string) => void;
}

/** Form for editing discovery services on the discovery service configuration tab.
    Includes the same form as other services but an addition section with a list
    of libraries and their registration statuses and buttons to register them. */
export default class ServiceWithRegistrationsEditForm<
  T extends ServicesWithRegistrationsData,
> extends ServiceEditForm<T> {
  declare props: Readonly<ServiceWithRegistrationsEditFormProps<T>>;

  render(): JSX.Element {
    return (
      <div>
        {super.render()}
        <LibraryRegistration
          registerLibrary={this.props.registerLibrary}
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
