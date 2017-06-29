import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { DRMServicesData, DRMServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

export class DRMServices extends EditableConfigList<DRMServicesData, DRMServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "drm_services";
  itemTypeName = "DRM service";
  urlBase = "/admin/web/config/drm/";
  identifierKey = "id";
  labelKey = "protocol";
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.drmServices && state.editor.drmServices.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  return {
    data: data,
    fetchError: state.editor.drmServices.fetchError,
    isFetching: state.editor.drmServices.isFetching || state.editor.drmServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchDRMServices()),
    editItem: (data: FormData) => dispatch(actions.editDRMService(data))
  };
}

const ConnectedDRMServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(DRMServices);

export default ConnectedDRMServices;