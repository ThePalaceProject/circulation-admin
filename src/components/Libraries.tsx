import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
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
  labelKey = "name";

  label(item): string {
    return item[this.labelKey] || item.short_name || item.uuid;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    data: state.editor.libraries && state.editor.libraries.data,
    editedIdentifier: state.editor.libraries && state.editor.libraries.editedIdentifier,
    fetchError: state.editor.libraries.fetchError,
    isFetching: state.editor.libraries.isFetching || state.editor.libraries.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchLibraries()),
    editItem: (data: FormData) => dispatch(actions.editLibrary(data))
  };
}

const ConnectedLibraries = connect<EditableConfigListStateProps<LibrariesData>, EditableConfigListDispatchProps<LibrariesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Libraries);

export default ConnectedLibraries;