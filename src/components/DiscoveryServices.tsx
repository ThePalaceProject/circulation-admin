import * as React from "react";
import { GenericEditableConfigList, EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { DiscoveryServicesData, DiscoveryServiceData, LibraryData, LibraryRegistrationsData } from "../interfaces";
import ServiceWithRegistrationsEditForm from "./ServiceWithRegistrationsEditForm";

export interface DiscoveryServicesStateProps extends EditableConfigListStateProps<DiscoveryServicesData> {
  isFetchingLibraryRegistrations?: boolean;
}

export interface DiscoveryServicesDispatchProps extends EditableConfigListDispatchProps<DiscoveryServicesData> {
  registerLibrary: (data: FormData) => Promise<void>;
  fetchLibraryRegistrations?: () => Promise<LibraryRegistrationsData>;
}

export interface DiscoveryServicesProps extends DiscoveryServicesStateProps, DiscoveryServicesDispatchProps, EditableConfigListOwnProps {};

class DiscoveryServiceEditForm extends ServiceWithRegistrationsEditForm<DiscoveryServicesData> {};

/** Right panel for discovery services on the system configuration page.
    Shows a list of current discovery services and allows creating a new
    service or editing or deleting an existing service. */
export class DiscoveryServices extends GenericEditableConfigList<DiscoveryServicesData, DiscoveryServiceData, DiscoveryServicesProps> {
  EditForm = DiscoveryServiceEditForm;
  listDataKey = "discovery_services";
  itemTypeName = "discovery service";
  urlBase = "/admin/web/config/discovery/";
  identifierKey = "id";
  labelKey = "name";

  static childContextTypes: React.ValidationMap<any> = {
    registerLibrary: React.PropTypes.func
  };

  getChildContext() {
    return {
      registerLibrary: (library: LibraryData, registration_stage: string) => {
        if (this.itemToEdit()) {
          const data = new (window as any).FormData();
          data.append("library_short_name", library.short_name);
          data.append("registration_stage", registration_stage);
          data.append("integration_id", this.itemToEdit().id);
          this.props.registerLibrary(data).then(() => {
            if (this.props.fetchLibraryRegistrations) {
              this.props.fetchLibraryRegistrations();
            }
          });
        }
      }
    };
  }

  componentWillMount() {
    super.componentWillMount();
    if (this.props.fetchLibraryRegistrations) {
      this.props.fetchLibraryRegistrations();
    }
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.discoveryServices && state.editor.discoveryServices.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  if (state.editor.discoveryServiceLibraryRegistrations && state.editor.discoveryServiceLibraryRegistrations.data) {
    data.libraryRegistrations = state.editor.discoveryServiceLibraryRegistrations.data.library_registrations;
  }
  // fetchError = an error involving loading the list of discovery services; formError = an error upon
  // submission of the create/edit form (including upon submitting a change to a library's registration).
  return {
    data: data,
    responseBody: state.editor.discoveryServices && state.editor.discoveryServices.successMessage,
    fetchError: state.editor.discoveryServices.fetchError,
    formError: state.editor.discoveryServices.formError || (state.editor.registerLibraryWithDiscoveryService && state.editor.registerLibraryWithDiscoveryService.fetchError),
    isFetching: state.editor.discoveryServices.isFetching || state.editor.discoveryServices.isEditing || (state.editor.registerLibraryWithDiscoveryService && state.editor.registerLibraryWithDiscoveryService.isFetching),
    isFetchingLibraryRegistrations: state.editor.discoveryServiceLibraryRegistrations && state.editor.discoveryServiceLibraryRegistrations.isFetching
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchDiscoveryServices()),
    editItem: (data: FormData) => dispatch(actions.editDiscoveryService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteDiscoveryService(identifier)),
    registerLibrary: (data: FormData) => dispatch(actions.registerLibraryWithDiscoveryService(data)),
    fetchLibraryRegistrations: () => dispatch(actions.fetchDiscoveryServiceLibraryRegistrations())
  };
}

const ConnectedDiscoveryServices = connect<DiscoveryServicesStateProps, DiscoveryServicesDispatchProps, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(DiscoveryServices);

export default ConnectedDiscoveryServices;
