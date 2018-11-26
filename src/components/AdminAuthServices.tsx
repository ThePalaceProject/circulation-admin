import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { AdminAuthServicesData, AdminAuthServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for admin authentication services on the system configuration page.
    Shows a list of current admin authentication services and allows creating a new
    service or editing or deleting an existing service. */
export class AdminAuthServices extends EditableConfigList<AdminAuthServicesData, AdminAuthServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "admin_auth_services";
  itemTypeName = "admin authentication service";
  urlBase = "/admin/web/config/adminAuth/";
  identifierKey = "protocol";
  labelKey = "protocol";
  limitOne = true;
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.adminAuthServices && state.editor.adminAuthServices.data);
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  // fetchError = an error involving loading the list of admin auth services; formError = an error upon
  // submission of the create/edit form.
  return {
    data,
    responseBody: state.editor.adminAuthServices && state.editor.adminAuthServices.successMessage,
    fetchError: state.editor.adminAuthServices.fetchError,
    formError: state.editor.adminAuthServices.formError,
    isFetching: state.editor.adminAuthServices.isFetching || state.editor.adminAuthServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchAdminAuthServices()),
    editItem: (data: FormData) => dispatch(actions.editAdminAuthService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteAdminAuthService(identifier))
  };
}

const ConnectedAdminAuthServices = connect<EditableConfigListStateProps<AdminAuthServicesData>, EditableConfigListDispatchProps<AdminAuthServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(AdminAuthServices);

export default ConnectedAdminAuthServices;
