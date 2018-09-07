import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { SitewideSettingsData, SitewideSettingData } from "../interfaces";
import SitewideSettingEditForm from "./SitewideSettingEditForm";

/** Right panel for sitewide settings on the system configuration page.
    Shows a list of current sitewide settings and allows creating a new
    setting or editing or deleting an existing setting. */
export class SitewideSettings extends EditableConfigList<SitewideSettingsData, SitewideSettingData> {
  EditForm = SitewideSettingEditForm;
  listDataKey = "settings";
  itemTypeName = "sitewide setting";
  urlBase = "/admin/web/config/sitewideSettings/";
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
  return {
    data: state.editor.sitewideSettings && state.editor.sitewideSettings.data,
    responseBody: state.editor.sitewideSettings && state.editor.sitewideSettings.responseBody,
    fetchError: state.editor.sitewideSettings.fetchError,
    isFetching: state.editor.sitewideSettings.isFetching || state.editor.sitewideSettings.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchSitewideSettings()),
    editItem: (data: FormData) => dispatch(actions.editSitewideSetting(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteSitewideSetting(identifier))
  };
}

const ConnectedSitewideSettings = connect<EditableConfigListStateProps<SitewideSettingsData>, EditableConfigListDispatchProps<SitewideSettingsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SitewideSettings);

export default ConnectedSitewideSettings;
