import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { LoggingServicesData, LoggingServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for logging settings on the system configuration page.
    Shows a list of current logging settings and allows creating a new
    setting or editing or deleting an existing setting. */
export class LoggingServices extends EditableConfigList<LoggingServicesData, LoggingServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "logging_services";
  itemTypeName = "logging services";
  urlBase = "/admin/web/config/logging/";
  identifierKey = "id";
  labelKey = "protocol";
}

function mapStateToProps(state, ownProps) {
  return {
    data: state.editor.loggingServices && state.editor.loggingServices.data,
    editedIdentifier: state.editor.loggingServices && state.editor.loggingServices.editedIdentifier,
    fetchError: state.editor.loggingServices.fetchError,
    isFetching: state.editor.loggingServices.isFetching || state.editor.loggingServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchLoggingServices()),
    editItem: (data: FormData) => dispatch(actions.editLoggingService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteLoggingService(identifier))
  };
}

const ConnectedLoggingSettings = connect<EditableConfigListStateProps<LoggingServicesData>, EditableConfigListDispatchProps<LoggingServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(LoggingServices);

export default ConnectedLoggingSettings;
