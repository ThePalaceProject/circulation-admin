import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { AdminAuthServicesData, AdminAuthServiceData } from "../interfaces";
import AdminAuthServiceEditForm from "./AdminAuthServiceEditForm";

export class AdminAuthServices extends EditableConfigList<AdminAuthServicesData, AdminAuthServiceData> {
  EditForm = AdminAuthServiceEditForm;
  listDataKey = "admin_auth_services";
  itemTypeName = "admin authentication service";
  urlBase = "/admin/web/config/adminAuth/";
  identifierKey = "provider";
  labelKey = "provider";
}

function mapStateToProps(state, ownProps) {
  return {
    data: state.editor.adminAuthServices && state.editor.adminAuthServices.data,
    fetchError: state.editor.adminAuthServices.fetchError,
    isFetching: state.editor.adminAuthServices.isFetching || state.editor.adminAuthServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchAdminAuthServices()),
    editItem: (data: FormData) => dispatch(actions.editAdminAuthService(data))
  };
}

const ConnectedAdminAuthServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(AdminAuthServices);

export default ConnectedAdminAuthServices;