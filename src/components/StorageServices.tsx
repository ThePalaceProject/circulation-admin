import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { StorageServicesData, StorageServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for storage services on the system configuration page. */
export class StorageServices extends EditableConfigList<StorageServicesData, StorageServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "storage_services";
  itemTypeName = "storage service";
  urlBase = "/admin/web/config/storage/";
  identifierKey = "id";
  labelKey = "protocol";
  limitOne = true;
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.storageServices && state.editor.storageServices.data || {});
  // fetchError = an error involving loading the list of storage services; formError = an error upon
  // submission of the create/edit form.
  return {
    data: data,
    responseBody: state.editor.storageServices && state.editor.storageServices.successMessage,
    fetchError: state.editor.storageServices.fetchError,
    formError: state.editor.storageServices.formError,
    isFetching: state.editor.storageServices.isFetching || state.editor.storageServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchStorageServices()),
    editItem: (data: FormData) => dispatch(actions.editStorageService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteStorageService(identifier))
  };
}

const ConnectedStorageServices = connect<EditableConfigListStateProps<StorageServicesData>, EditableConfigListDispatchProps<StorageServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(StorageServices);

export default ConnectedStorageServices;
