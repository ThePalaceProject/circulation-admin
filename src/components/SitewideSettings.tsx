import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { SitewideSettingsData, SitewideSettingData } from "../interfaces";
import SitewideSettingEditForm from "./SitewideSettingEditForm";

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
    fetchError: state.editor.sitewideSettings.fetchError,
    isFetching: state.editor.sitewideSettings.isFetching || state.editor.sitewideSettings.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchSitewideSettings()),
    editItem: (data: FormData) => dispatch(actions.editSitewideSetting(data, ownProps.csrfToken))
  };
}

const ConnectedSitewideSettings = connect<EditableConfigListStateProps<SitewideSettingsData>, EditableConfigListDispatchProps<SitewideSettingsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SitewideSettings);

export default ConnectedSitewideSettings;