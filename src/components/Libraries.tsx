import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { LibrariesData, LibraryData } from "../interfaces";
import LibraryEditForm from "./LibraryEditForm";

export class Libraries extends EditableConfigList<LibrariesData, LibraryData> {
  EditForm = LibraryEditForm;
  listDataKey = "libraries";
  itemTypeName = "library";
  urlBase = "/admin/web/config/libraries/";
  identifierKey = "uuid";
}

function mapStateToProps(state, ownProps) {
  return {
    data: state.editor.libraries && state.editor.libraries.data,
    fetchError: state.editor.libraries.fetchError,
    isFetching: state.editor.libraries.isFetching || state.editor.libraries.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchLibraries()),
    editItem: (data: FormData) => dispatch(actions.editLibrary(data))
  };
}

const ConnectedLibraries = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Libraries);

export default ConnectedLibraries;