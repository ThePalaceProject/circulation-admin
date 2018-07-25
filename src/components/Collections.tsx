import * as React from "react";
import { GenericEditableConfigList, EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CollectionsData, CollectionData, LibraryData, LibraryRegistrationsData, ServiceData } from "../interfaces";
import ServiceWithRegistrationsEditForm from "./ServiceWithRegistrationsEditForm";

export interface CollectionsStateProps extends EditableConfigListStateProps<CollectionsData> {
  isFetchingLibraryRegistrations?: boolean;
}

export interface CollectionsDispatchProps extends EditableConfigListDispatchProps<CollectionsData> {
  registerLibrary: (data: FormData) => Promise<void>;
  fetchLibraryRegistrations?: () => Promise<LibraryRegistrationsData>;
}

export interface CollectionsProps extends CollectionsStateProps, CollectionsDispatchProps, EditableConfigListOwnProps {}

export interface AdditionalContentState {
  expand: boolean;
}
export interface AdditionalContentProps extends CollectionsProps {
  item: ServiceData;
}

class CollectionEditForm extends ServiceWithRegistrationsEditForm<CollectionsData> {};

/** Right panel for collections on the system configuration page.
    Shows a list of current collections and allows creating a new
    collection or editing or deleting an existing collection.
    Also allows registering libraries with the collection when
    the collection supports it. */
export class AdditionalContent extends React.Component<AdditionalContentProps, AdditionalContentState> {
  constructor(props) {
    super(props);

    this.state = { expand: false };
    this.toggleView = this.toggleView.bind(this);
  }

  toggleView() {
    this.setState({ expand: !this.state.expand });
  }

  render() {
    console.log(this.props);
    const collection = this.props.item;
    const expand = this.state.expand;

    if (!collection || !collection.self_test_results) {
      return null;
    }
    const startTime = new Date(collection.self_test_results.start).toDateString();
    const endTime = new Date(collection.self_test_results.end);
    const expandResultClass = expand ? "active in" : "";
    const resultsLabel = expand ? "Collapse" : "Expand";

    return (
      <div className="collection-selftests">
        <div>
          <p>Tests last ran on {startTime} and lasted {collection.self_test_results.duration}s.</p>
          <button onClick={this.toggleView} className="btn btn-default">{resultsLabel} Results</button>
        </div>
        <div className={`results collapse ${expandResultClass}`}>
          <h3>Self Test Results</h3>
          <button onClick={this.toggleView} className="btn btn-default">Run tests</button>
          <ul>
            {
              collection.self_test_results &&
              collection.self_test_results.results.map(result => {
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
      </div>
    );
  }
}

export class Collections extends GenericEditableConfigList<CollectionsData, CollectionData, CollectionsProps> {
  EditForm = CollectionEditForm;
  AdditionalContent = AdditionalContent;
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

const ConnectedCollections = connect<EditableConfigListStateProps<CollectionsData>, EditableConfigListDispatchProps<CollectionsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(Collections);

export default ConnectedCollections;
