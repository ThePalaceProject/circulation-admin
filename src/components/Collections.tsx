import * as React from "react";
import { GenericEditableConfigList, EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CollectionsData, CollectionData, LibraryData, LibraryRegistrationsData, ServiceData } from "../interfaces";
import ServiceWithRegistrationsEditForm from "./ServiceWithRegistrationsEditForm";
import SelfTests from "./SelfTests";

export interface CollectionsStateProps extends EditableConfigListStateProps<CollectionsData> {
  isFetchingLibraryRegistrations?: boolean;
}

export interface CollectionsDispatchProps extends EditableConfigListDispatchProps<CollectionsData> {
  registerLibrary: (data: FormData) => Promise<void>;
  fetchLibraryRegistrations?: () => Promise<LibraryRegistrationsData>;
}

export interface CollectionsProps extends CollectionsStateProps, CollectionsDispatchProps, EditableConfigListOwnProps {}

class CollectionEditForm extends ServiceWithRegistrationsEditForm<CollectionsData> {};

/** Right panel for collections on the system configuration page.
    Shows a list of current collections and allows creating a new
    collection or editing or deleting an existing collection.
    Also allows registering libraries with the collection when
    the collection supports it. */
export class Collections extends GenericEditableConfigList<CollectionsData, CollectionData, CollectionsProps> {
  EditForm = CollectionEditForm;
  AdditionalContent = SelfTests;
  listDataKey = "collections";
  itemTypeName = "collection";
  urlBase = "/admin/web/config/collections/";
  identifierKey = "id";
  labelKey = "name";

  static childContextTypes: React.ValidationMap<any> = {
    registerLibrary: React.PropTypes.func,
  };

  getChildContext() {
    return {
      registerLibrary: (library: LibraryData) => {
        if (this.itemToEdit()) {
          const data = new (window as any).FormData();
          data.append("library_short_name", library.short_name);
          data.append("collection_id", this.itemToEdit().id);
          this.props.registerLibrary(data).then(() => {
            if (this.props.fetchLibraryRegistrations) {
              this.props.fetchLibraryRegistrations();
            }
          });
        }
      }
    };
  }

  componentWillMount() {
    super.componentWillMount();
    if (this.props.fetchLibraryRegistrations) {
      this.props.fetchLibraryRegistrations();
    }
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.collections && state.editor.collections.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  if (state.editor.collectionLibraryRegistrations && state.editor.collectionLibraryRegistrations.data) {
    data.libraryRegistrations = state.editor.collectionLibraryRegistrations.data.library_registrations;
  }
  // fetchError = an error involving loading the list of collections; formError = an error upon
  // submission of the create/edit form (including upon submitting a change to a library's registration).
  return {
    data: data,
    responseBody: state.editor.collections && state.editor.collections.successMessage,
    fetchError: state.editor.collections.fetchError,
    formError: state.editor.collections.formError || (state.editor.collectionLibraryRegistrations && state.editor.collectionLibraryRegistrations.fetchError) || (state.editor.registerLibraryWithCollection && state.editor.registerLibraryWithCollection.fetchError),
    isFetching: state.editor.collections.isFetching || state.editor.collections.isEditing,
    isFetchingLibraryRegistrations: state.editor.collectionLibraryRegistrations && state.editor.collectionLibraryRegistrations.isFetching
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchCollections()),
    editItem: (data: FormData) => dispatch(actions.editCollection(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteCollection(identifier)),
    registerLibrary: (data: FormData) => dispatch(actions.registerLibraryWithCollection(data)),
    fetchLibraryRegistrations: () => dispatch(actions.fetchCollectionLibraryRegistrations())
  };
}

const ConnectedCollections = connect<EditableConfigListStateProps<CollectionsData>, EditableConfigListDispatchProps<CollectionsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(Collections);

export default ConnectedCollections;
