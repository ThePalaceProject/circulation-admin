import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CDNServicesData, CDNServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

export class CDNServices extends EditableConfigList<CDNServicesData, CDNServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "cdn_services";
  itemTypeName = "CDN service";
  urlBase = "/admin/web/config/cdn/";
  identifierKey = "id";
  labelKey = "protocol";

  label(item): string {
    return item.settings && item.settings.url;
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.cdnServices && state.editor.cdnServices.data || {});
  return {
    data: data,
    editedIdentifier: state.editor.cdnServices && state.editor.cdnServices.editedIdentifier,
    fetchError: state.editor.cdnServices.fetchError,
    isFetching: state.editor.cdnServices.isFetching || state.editor.cdnServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchCDNServices()),
    editItem: (data: FormData) => dispatch(actions.editCDNService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteCDNService(identifier))
  };
}

const ConnectedCDNServices = connect<EditableConfigListStateProps<CDNServicesData>, EditableConfigListDispatchProps<CDNServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(CDNServices);

export default ConnectedCDNServices;