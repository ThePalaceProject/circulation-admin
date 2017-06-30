import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { SearchServicesData, SearchServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

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
  return {
    data: data,
    fetchError: state.editor.searchServices.fetchError,
    isFetching: state.editor.searchServices.isFetching || state.editor.searchServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchSearchServices()),
    editItem: (data: FormData) => dispatch(actions.editSearchService(data))
  };
}

const ConnectedSearchServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(SearchServices);

export default ConnectedSearchServices;