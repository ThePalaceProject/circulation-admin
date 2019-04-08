import * as React from "react";
import { GenericEditableConfigList, EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { LibrariesData, LibraryData, LanguagesData } from "../interfaces";
import Admin from "../models/Admin";
import LibraryEditForm from "./LibraryEditForm";

/** Right panel for library configuration on the system configuration page.
    Shows a list of current libraries and allows creating a new library or
    editing or deleting an existing library. */

export interface LibrariesStateProps extends EditableConfigListStateProps<LibrariesData> {
  additionalData?: LanguagesData;
}

export interface LibrariesDispatchProps extends EditableConfigListDispatchProps<LibrariesData> {
  fetchLanguages: () => void;
}

export interface LibrariesProps extends LibrariesStateProps, LibrariesDispatchProps, EditableConfigListOwnProps {}

export class Libraries extends GenericEditableConfigList<LibrariesData, LibraryData, LibrariesProps> {
  EditForm = LibraryEditForm;
  listDataKey = "libraries";
  itemTypeName = "library";
  urlBase = "/admin/web/config/libraries/";
  identifierKey = "uuid";
  labelKey = "name";

  context: { admin: Admin };
  static contextTypes = {
    admin: React.PropTypes.object.isRequired
  };

  componentWillMount() {
    super.componentWillMount();
    this.props.fetchLanguages();
  }

  label(item): string {
    return item[this.labelKey] || item.short_name || item.uuid;
  }

  canCreate() {
    return this.context.admin.isSystemAdmin();
  }

  canDelete() {
    return this.context.admin.isSystemAdmin();
  }
}

function mapStateToProps(state, ownProps) {
  // fetchError = an error involving loading the list of libraries; formError = an error upon submission of the
  // create/edit form.
  return {
    data: state.editor.libraries && state.editor.libraries.data,
    responseBody: state.editor.libraries && state.editor.libraries.successMessage,
    fetchError: state.editor.libraries.fetchError,
    formError: state.editor.libraries.formError,
    isFetching: state.editor.libraries.isFetching || state.editor.libraries.isEditing,
    additionalData: state.editor.languages && state.editor.languages.data
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchLibraries()),
    editItem: (data: FormData) => dispatch(actions.editLibrary(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteLibrary(identifier)),
    fetchLanguages: () => dispatch(actions.fetchLanguages())
  };
}

const ConnectedLibraries = connect<EditableConfigListStateProps<LibrariesData>, EditableConfigListDispatchProps<LibrariesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Libraries);

export default ConnectedLibraries;
