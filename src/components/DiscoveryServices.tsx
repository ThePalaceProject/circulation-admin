import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { DiscoveryServicesData, DiscoveryServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

export class DiscoveryServices extends EditableConfigList<DiscoveryServicesData, DiscoveryServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "discovery_services";
  itemTypeName = "discovery service";
  urlBase = "/admin/web/config/discovery/";
  identifierKey = "id";
  labelKey = "name";
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.discoveryServices && state.editor.discoveryServices.data || {});
  return {
    data: data,
    fetchError: state.editor.discoveryServices.fetchError,
    isFetching: state.editor.discoveryServices.isFetching || state.editor.discoveryServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchDiscoveryServices()),
    editItem: (data: FormData) => dispatch(actions.editDiscoveryService(data))
  };
}

const ConnectedDiscoveryServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(DiscoveryServices);

export default ConnectedDiscoveryServices;