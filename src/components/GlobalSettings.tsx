import * as React from "react";
import { connect } from "react-redux";
import { Alert } from "react-bootstrap";
import { Form } from "library-simplified-reusable-components";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ActionCreator from "../actions";
import { GlobalSettingsData } from "../interfaces";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
  EditableConfigListProps,
} from "./EditableConfigList";
import ErrorMessage from "./ErrorMessage";
import ProtocolFormField from "./ProtocolFormField";

/** Settings panel for sitewide global configuration (country, state, etc.). */
export class GlobalSettings extends EditableConfigList<
  GlobalSettingsData,
  never
> {
  EditForm = null;
  listDataKey = "schema";
  itemTypeName = "global setting";
  urlBase = "/admin/web/config/globalSettings/";
  identifierKey = "key";
  labelKey = "label";

  render() {
    const {
      data,
      fetchError,
      formError,
      isFetching,
      responseBody,
    } = this.props;

    const canEdit = this.context.admin.isSystemAdmin();

    return (
      <div className="global-settings">
        <h2>Global Settings</h2>
        {responseBody && (
          <Alert bsStyle="success">Global settings saved successfully.</Alert>
        )}
        {fetchError && <ErrorMessage error={fetchError} />}
        {formError && <ErrorMessage error={formError} />}
        {isFetching && <LoadingIndicator />}
        {!isFetching && data?.schema && (
          <Form
            onSubmit={this.editItem}
            className="no-border edit-form"
            disableButton={!canEdit}
            content={data.schema.map((setting) => (
              <ProtocolFormField
                key={setting.key}
                setting={setting}
                disabled={!canEdit}
                value={data.settings?.[setting.key]}
                readOnly={!canEdit}
              />
            ))}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: state.editor.globalSettings.data,
    responseBody: state.editor.globalSettings.successMessage,
    fetchError: state.editor.globalSettings.fetchError,
    formError: state.editor.globalSettings.formError,
    isFetching:
      state.editor.globalSettings.isFetching ||
      state.editor.globalSettings.isEditing,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchGlobalSettings()),
    editItem: (data: FormData) => dispatch(actions.editGlobalSettings(data)),
  };
}

const ConnectedGlobalSettings = connect<
  EditableConfigListStateProps<GlobalSettingsData>,
  EditableConfigListDispatchProps<GlobalSettingsData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(GlobalSettings);

export default ConnectedGlobalSettings;
