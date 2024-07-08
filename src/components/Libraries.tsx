import * as React from "react";
import {
  GenericEditableConfigList,
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect, ConnectedProps } from "react-redux";
import * as PropTypes from "prop-types";
import ActionCreator from "../actions";
import { LibrariesData, LibraryData, LanguagesData } from "../interfaces";
import Admin from "../models/Admin";
import LibraryEditForm from "./LibraryEditForm";
import { adminApi } from "../features/api/admin";
import { AppDispatch, RootState } from "../store";

/** Right panel for library configuration on the system configuration page.
    Shows a list of current libraries and allows creating a new library or
    editing or deleting an existing library. */

const connector = connect(mapStateToProps, mapDispatchToProps);
export type LibrariesProps = ConnectedProps<typeof connector> &
  EditableConfigListOwnProps;

export class Libraries extends GenericEditableConfigList<
  LibrariesData,
  LibraryData,
  LibrariesProps
> {
  EditForm = LibraryEditForm;
  listDataKey = "libraries";
  itemTypeName = "library";
  urlBase = "/admin/web/config/libraries/";
  identifierKey = "uuid";
  labelKey = "name";

  context: { admin: Admin };
  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  // RTK Query subscriptions.
  languagesSubscription;

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    // Subscribe to RTK Query caches and fetch, as needed.
    this.languagesSubscription = this.props.fetchLanguages();
  }

  unsubscribe() {
    // Unsubscribe from RTK Query caches.
    this.languagesSubscription.unsubscribe();
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

function mapStateToProps(state: RootState) {
  // fetchError = an error involving loading the list of libraries; formError = an error upon submission of the
  // create/edit form.
  return {
    data: state.editor.libraries && state.editor.libraries.data,
    responseBody:
      state.editor.libraries && state.editor.libraries.successMessage,
    fetchError: state.editor.libraries.fetchError,
    formError: state.editor.libraries.formError,
    isFetching:
      state.editor.libraries.isFetching || state.editor.libraries.isEditing,
    additionalData: adminApi.endpoints.getLanguages.select()(state).data,
  };
}

function mapDispatchToProps(
  dispatch: AppDispatch,
  ownProps: EditableConfigListOwnProps
) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchLibraries()),
    editItem: (data: FormData) => dispatch(actions.editLibrary(data)),
    deleteItem: (identifier: string | number) =>
      dispatch(actions.deleteLibrary(identifier)),
    fetchLanguages: () => dispatch(adminApi.endpoints.getRoles.initiate()),
  };
}

export default connector(Libraries);
