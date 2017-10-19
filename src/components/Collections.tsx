import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CollectionsData, CollectionData, LibraryData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

export class Collections extends EditableConfigList<CollectionsData, CollectionData> {
  EditForm =  ServiceEditForm;
  listDataKey = "collections";
  itemTypeName = "collection";
  urlBase = "/admin/web/config/collections/";
  identifierKey = "id";
  labelKey = "name";
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.collections && state.editor.collections.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  return {
    data: data,
    fetchError: state.editor.collections.fetchError,
    isFetching: state.editor.collections.isFetching || state.editor.collections.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchCollections()),
    editItem: (data: FormData) => dispatch(actions.editCollection(data))
  };
}

const ConnectedCollections = connect<EditableConfigListStateProps<CollectionsData>, EditableConfigListDispatchProps<CollectionsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(Collections);

export default ConnectedCollections;