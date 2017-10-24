import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { AdminAuthServicesData, AdminAuthServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

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
  return {
    data: state.editor.adminAuthServices && state.editor.adminAuthServices.data,
    editedIdentifier: state.editor.adminAuthServices && state.editor.adminAuthServices.editedIdentifier,
    fetchError: state.editor.adminAuthServices.fetchError,
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