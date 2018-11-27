import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { AnalyticsServicesData, AnalyticsServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for analytics services on the system configuration page.
    Shows a list of current analytics services and allows creating a new
    service or editing or deleting an existing service. */
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
  // fetchError = an error involving loading the list of analytics services; formError = an error upon submission of the
  // create/edit form.
  return {
    data: data,
    responseBody: state.editor.analyticsServices && state.editor.analyticsServices.successMessage,
    fetchError: state.editor.analyticsServices.fetchError,
    formError: state.editor.analyticsServices.formError,
    isFetching: state.editor.analyticsServices.isFetching || state.editor.analyticsServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchAnalyticsServices()),
    editItem: (data: FormData) => dispatch(actions.editAnalyticsService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteAnalyticsService(identifier))
  };
}

const ConnectedAnalyticsServices = connect<EditableConfigListStateProps<AnalyticsServicesData>, EditableConfigListDispatchProps<AnalyticsServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(AnalyticsServices);

export default ConnectedAnalyticsServices;
