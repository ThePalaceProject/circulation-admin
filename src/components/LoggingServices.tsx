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
  itemTypeName = "logging service";
  urlBase = "/admin/web/config/logging/";
  identifierKey = "id";
  labelKey = "protocol";
}

function mapStateToProps(state, ownProps) {
  // fetchError = an error involving loading the list of logging services; formError = an error upon submission of the 
  // create/edit form.
  return {
    data: state.editor.loggingServices && state.editor.loggingServices.data,
    responseBody: state.editor.loggingServices && state.editor.loggingServices.successMessage,
    fetchError: state.editor.loggingServices.fetchError,
    formError: state.editor.loggingServices.formError,
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
