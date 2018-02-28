import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { LoggingSettingsData, LoggingSettingData } from "../interfaces";
// import LoggingSettingEditForm from "./LoggingSettingEditForm";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for logging settings on the system configuration page.
    Shows a list of current logging settings and allows creating a new
    setting or editing or deleting an existing setting. */
export class LoggingSettings extends EditableConfigList<LoggingSettingsData, LoggingSettingData> {
  EditForm = ServiceEditForm;
  listDataKey = "settings";
  itemTypeName = "logging setting";
  urlBase = "/admin/web/config/loggingSettings/";
  identifierKey = "key";
  labelKey = "key";

  label(item): string {
    for (const setting of this.props.data.all_settings) {
      if (setting.key === item.key) {
        return setting.label;
      }
    }
    return item.key;
  }
}

function mapStateToProps(state, ownProps) {
  // console.log(state.editor.loggingSettings)
  return {
    data: state.editor.loggingSettings && state.editor.loggingSettings.data,
    editedIdentifier: state.editor.loggingSettings && state.editor.loggingSettings.editedIdentifier,
    fetchError: state.editor.loggingSettings.fetchError,
    isFetching: state.editor.loggingSettings.isFetching || state.editor.loggingSettings.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchLoggingSettings()),
    editItem: (data: FormData) => dispatch(actions.editLoggingSetting(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteLoggingSetting(identifier))
  };
}

const ConnectedLoggingSettings = connect<EditableConfigListStateProps<LoggingSettingsData>, EditableConfigListDispatchProps<LoggingSettingsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(LoggingSettings);

export default ConnectedLoggingSettings;
