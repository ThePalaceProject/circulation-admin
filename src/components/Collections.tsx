import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { CollectionData, LibraryData, ProtocolData } from "../interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import CollectionEditForm from "./CollectionEditForm";

export interface CollectionsProps {
  store?: Store<State>;
  collections?: CollectionData[];
  protocols?: ProtocolData[];
  allLibraries?: LibraryData[];
  fetchError?: FetchErrorData;
  fetchCollections?: () => Promise<any>;
  editCollection?: (data: FormData) => Promise<any>;
  isFetching?: boolean;
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
}

export class Collections extends React.Component<CollectionsProps, any> {
  constructor(props) {
    super(props);
    this.editCollection = this.editCollection.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }

        { !this.props.isFetching && !this.props.editOrCreate && this.props.collections && this.props.collections.length > 0 &&
          <div>
            <h2>Edit collections</h2>
            <ul>
              { this.props.collections.map((collection, index) =>
                  <li key={index}>
                    <h3>{collection.name}</h3>
                    <a href={"/admin/web/config/collections/edit/" + collection.name}>Edit collection</a>
                  </li>
                )
              }
            </ul>
          </div>
        }

        { !this.props.isFetching && !this.props.editOrCreate &&
          <a href="/admin/web/config/collections/create">Create a new collection</a>
        }

        { !this.props.isFetching && (this.props.editOrCreate === "create") &&
          <div>
            <h2>Create a new collection</h2>
            <CollectionEditForm
              protocols={this.props.protocols}
              allLibraries={this.props.allLibraries}
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editCollection={this.editCollection}
              />
          </div>
        }

        { !this.props.isFetching && this.collectionToEdit() &&
          <div>
            <h2>Edit collection</h2>
            <CollectionEditForm
              collection={this.collectionToEdit()}
              protocols={this.props.protocols}
              allLibraries={this.props.allLibraries}
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editCollection={this.editCollection}
              />
          </div>
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.fetchCollections) {
      this.props.fetchCollections();
    }
  }

  editCollection(data: FormData) {
    return this.props.editCollection(data).then(this.props.fetchCollections);
  }

  collectionToEdit() {
    if (this.props.editOrCreate === "edit" && this.props.collections) {
      for (const collection of this.props.collections) {
        if (collection.name === this.props.identifier) {
          return collection;
        }
      }
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    collections: state.editor.collections && state.editor.collections.data && state.editor.collections.data.collections,
    protocols: state.editor.collections && state.editor.collections.data && state.editor.collections.data.protocols,
    allLibraries: state.editor.libraries && state.editor.libraries.data && state.editor.libraries.data.libraries,
    fetchError: state.editor.collections.fetchError,
    isFetching: state.editor.collections.isFetching || state.editor.collections.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchCollections: () => dispatch(actions.fetchCollections()),
    editCollection: (data: FormData) => dispatch(actions.editCollection(data))
  };
}

const ConnectedCollections = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps,
)(Collections);

export default ConnectedCollections;