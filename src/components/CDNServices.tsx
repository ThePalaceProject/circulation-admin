import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CDNServicesData, CDNServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for CDN services on the system configuration page.
    Shows a list of current CDN services and allows creating a new
    service or editing or deleting an existing service. */
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
  // fetchError = an error involving loading the list of CDN services; formError = an error upon
  // submission of the create/edit form.
  return {
    data: data,
    responseBody: state.editor.cdnServices && state.editor.cdnServices.successMessage,
    fetchError: state.editor.cdnServices.fetchError,
    formError: state.editor.cdnServices.formError,
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
