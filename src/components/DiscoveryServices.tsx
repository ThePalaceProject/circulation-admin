import * as React from "react";
import { GenericEditableConfigList, EditableConfigListProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { DiscoveryServicesData, DiscoveryServiceData, LibraryData } from "../interfaces";
import DiscoveryServiceEditForm from "./DiscoveryServiceEditForm";

export interface DiscoveryServicesProps extends EditableConfigListProps<DiscoveryServicesData> {
  registerLibrary: (library: LibraryData) => void;
}

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
          data.append("csrf_token", this.props.csrfToken);
          data.append("library_short_name", library.short_name);
          data.append("integration_id", this.itemToEdit().id);
          this.props.registerLibrary(data);
        }
      }
    };
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.discoveryServices && state.editor.discoveryServices.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  return {
    data: data,
    fetchError: state.editor.discoveryServices.fetchError || (state.editor.registerLibrary && state.editor.registerLibrary.fetchError),
    isFetching: state.editor.discoveryServices.isFetching || state.editor.discoveryServices.isEditing || (state.editor.registerLibrary && state.editor.registerLibrary.isFetching)
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchDiscoveryServices()),
    editItem: (data: FormData) => dispatch(actions.editDiscoveryService(data)),
    registerLibrary: (data: FormData) => dispatch(actions.registerLibrary(data))
  };
}

const ConnectedDiscoveryServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(DiscoveryServices);

export default ConnectedDiscoveryServices;