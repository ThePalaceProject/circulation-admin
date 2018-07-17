import * as React from "react";
import { GenericEditableConfigList, EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CollectionsData, CollectionData, LibraryData, LibraryRegistrationsData } from "../interfaces";
import ServiceWithRegistrationsEditForm from "./ServiceWithRegistrationsEditForm";

export interface CollectionsStateProps extends EditableConfigListStateProps<CollectionsData> {
  isFetchingLibraryRegistrations?: boolean;
}

export interface CollectionsDispatchProps extends EditableConfigListDispatchProps<CollectionsData> {
  registerLibrary: (data: FormData) => Promise<void>;
  fetchLibraryRegistrations?: () => Promise<LibraryRegistrationsData>;
}

export interface CollectionsProps extends CollectionsStateProps, CollectionsDispatchProps, EditableConfigListOwnProps {
  // collections: CollectionsData[];
}

class CollectionEditForm extends ServiceWithRegistrationsEditForm<CollectionsData> {};

/** Right panel for collections on the system configuration page.
    Shows a list of current collections and allows creating a new
    collection or editing or deleting an existing collection.
    Also allows registering libraries with the collection when
    the collection supports it. */
export class SelfTests extends GenericEditableConfigList<CollectionsData, CollectionData, CollectionsProps> {
  EditForm = CollectionEditForm;
  listDataKey = "self_tests";
  itemTypeName = "self tests";
  urlBase = "/admin/web/config/selftests/";
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


  render(): JSX.Element {
    // console.log(this.props, this.state);
    const collections = this.props.data.collections ? this.props.data.collections : [];

    return (
      <div>
        <div>Self Tests</div>

        <p>
          Run new self tests <button>run tests</button>
        </p>

        <p>
          Previous results
        </p>

        <ul>
          {
            collections.map(col => {
              if (!col.self_test_results) {
                return null;
              }

              const startTime = new Date(col.self_test_results.start).toDateString();
              const endTime = new Date(col.self_test_results.end);

              return (
                <li>
                  <h2>Collection: {col.name}</h2>
                  <div>
                    <p>Tests last ran on {startTime} and lasted {col.self_test_results.duration}s.</p>
                    <h3>Test Results</h3>
                    <ul>
                      {
                        col.self_test_results &&
                        col.self_test_results.results.map(result => {
                          const successColor = result.success ? "success" : "failure";
                          return (
                            <li className={successColor}>
                              <h4>{result.name}</h4>
                              {result.result ? <p>result: {result.result}</p> : null}
                              <p>success: {`${result.success}`}</p>
                              {
                                !result.success && (
                                  <p>exception: {result.exception.message}</p>
                                )
                              }
                            </li>
                          );
                        })
                      }
                    </ul>
                  </div>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
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
  return {
    data: data,
    editedIdentifier: state.editor.collections && state.editor.collections.editedIdentifier,
    fetchError: state.editor.collections.fetchError || (state.editor.collectionLibraryRegistrations && state.editor.collectionLibraryRegistrations.fetchError) || (state.editor.registerLibraryWithCollection && state.editor.registerLibraryWithCollection.fetchError),
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

const ConnectedSelfTests = connect<EditableConfigListStateProps<CollectionsData>, EditableConfigListDispatchProps<CollectionsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelfTests);

export default ConnectedSelfTests;
