import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { AnalyticsServicesData, AnalyticsServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

export class AnalyticsServices extends EditableConfigList<AnalyticsServicesData, AnalyticsServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "analytics_services";
  itemTypeName = "analytics service";
  urlBase = "/admin/web/config/analytics/";
  identifierKey = "id";
  labelKey = "protocol";

  label(item): string {
    for (const protocol of this.props.data.protocols) {
      if (protocol.name === item.protocol) {
        return protocol.label;
      }
    }
    return item.protocol;
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.analyticsServices && state.editor.analyticsServices.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  return {
    data: data,
    fetchError: state.editor.analyticsServices.fetchError,
    isFetching: state.editor.analyticsServices.isFetching || state.editor.analyticsServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchAnalyticsServices()),
    editItem: (data: FormData) => dispatch(actions.editAnalyticsService(data))
  };
}

const ConnectedAnalyticsServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(AnalyticsServices);

export default ConnectedAnalyticsServices;