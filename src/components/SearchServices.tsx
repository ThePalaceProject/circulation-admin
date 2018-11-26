import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { SearchServicesData, SearchServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for search services on the system configuration page.
    Shows a list of current search services and allows creating a new
    service or editing or deleting an existing service. */
export class SearchServices extends EditableConfigList<SearchServicesData, SearchServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "search_services";
  itemTypeName = "search service";
  urlBase = "/admin/web/config/search/";
  identifierKey = "id";
  labelKey = "protocol";
  limitOne = true;
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.searchServices && state.editor.searchServices.data || {});
  // fetchError = an error involving loading the list of search services; formError = an error upon
  // submission of the create/edit form.
  return {
    data: data,
    responseBody: state.editor.searchServices && state.editor.searchServices.successMessage,
    fetchError: state.editor.searchServices.fetchError,
    formError: state.editor.searchServices.formError,
    isFetching: state.editor.searchServices.isFetching || state.editor.searchServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchSearchServices()),
    editItem: (data: FormData) => dispatch(actions.editSearchService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteSearchService(identifier))
  };
}

const ConnectedSearchServices = connect<EditableConfigListStateProps<SearchServicesData>, EditableConfigListDispatchProps<SearchServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SearchServices);

export default ConnectedSearchServices;
