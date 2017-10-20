import * as React from "react";
import { GenericEditableConfigList, EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { DiscoveryServicesData, DiscoveryServiceData, LibraryData, LibraryRegistrationsData } from "../interfaces";
import DiscoveryServiceEditForm from "./DiscoveryServiceEditForm";

export interface DiscoveryServicesStateProps extends EditableConfigListStateProps<DiscoveryServicesData> {
  isFetchingLibraryRegistrations?: boolean;
}

export interface DiscoveryServicesDispatchProps extends EditableConfigListDispatchProps<DiscoveryServicesData> {
  registerLibrary: (data: FormData) => Promise<void>;
  fetchLibraryRegistrations?: () => Promise<LibraryRegistrationsData>;
}

export interface DiscoveryServicesProps extends DiscoveryServicesStateProps, DiscoveryServicesDispatchProps, EditableConfigListOwnProps {};

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
      registerLibrary: (library: LibraryData) => {
        if (this.itemToEdit()) {
          const data = new (window as any).FormData();
          data.append("library_short_name", library.short_name);
          data.append("integration_id", this.itemToEdit().id);
          this.props.registerLibrary(data).then(() => {
            if (this.props.fetchLibraryRegistrations) {
              console.log("fetching");
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
  if (state.editor.libraryRegistrations && state.editor.libraryRegistrations.data) {
    data.libraryRegistrations = state.editor.libraryRegistrations.data.library_registrations;
  }
  return {
    data: data,
    fetchError: state.editor.discoveryServices.fetchError || (state.editor.registerLibrary && state.editor.registerLibrary.fetchError),
    isFetching: state.editor.discoveryServices.isFetching || state.editor.discoveryServices.isEditing || (state.editor.registerLibrary && state.editor.registerLibrary.isFetching),
    isFetchingLibraryRegistrations: state.editor.libraryRegistrations && state.editor.libraryRegistrations.isFetching
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchDiscoveryServices()),
    editItem: (data: FormData) => dispatch(actions.editDiscoveryService(data)),
    registerLibrary: (data: FormData) => dispatch(actions.registerLibrary(data)),
    fetchLibraryRegistrations: () => dispatch(actions.fetchLibraryRegistrations())
  };
}

const ConnectedDiscoveryServices = connect<DiscoveryServicesStateProps, DiscoveryServicesDispatchProps, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(DiscoveryServices);

export default ConnectedDiscoveryServices;