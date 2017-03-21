import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import LibraryEditForm from "./LibraryEditForm";

export interface LibrariesProps {
  store?: Store<State>;
  libraries?: LibraryData[];
  fetchError?: FetchErrorData;
  fetchLibraries?: () => Promise<any>;
  editLibrary?: (data: FormData) => Promise<any>;
  isFetching?: boolean;
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
}

export class Libraries extends React.Component<LibrariesProps, any> {
  constructor(props) {
    super(props);
    this.editLibrary = this.editLibrary.bind(this);
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

        { !this.props.isFetching && !this.props.editOrCreate && this.props.libraries && this.props.libraries.length > 0 &&
          <div>
            <h2>Edit libraries</h2>
            <ul>
              { this.props.libraries && this.props.libraries.map((library, index) =>
                  <li key={index}>
                    <h3>{library.name || library.short_name}</h3>
                    <a href={"/admin/web/config/libraries/edit/" + library.uuid}>Edit library</a>
                  </li>
                )
              }
            </ul>
          </div>
        }

        { !this.props.isFetching && !this.props.editOrCreate &&
          <a href="/admin/web/config/libraries/create">Create a new library</a>
        }

        { !this.props.isFetching && (this.props.editOrCreate === "create") &&
          <div>
            <h2>Create a new library</h2>
            <LibraryEditForm
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editLibrary={this.editLibrary}
              />
          </div>
        }

        { !this.props.isFetching && this.libraryToEdit() &&
          <div>
            <h2>Edit library</h2>
            <LibraryEditForm
              library={this.libraryToEdit()}
              csrfToken={this.props.csrfToken}
              disabled={this.props.isFetching}
              editLibrary={this.editLibrary}
              />
          </div>
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.fetchLibraries) {
      this.props.fetchLibraries();
    }
  }

  editLibrary(data: FormData) {
    return this.props.editLibrary(data).then(this.props.fetchLibraries);
  }

  libraryToEdit() {
    if (this.props.editOrCreate === "edit" && this.props.libraries) {
      for (const library of this.props.libraries) {
        if (library.uuid === this.props.identifier) {
          return library;
        }
      }
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    libraries: state.editor.libraries && state.editor.libraries.data && state.editor.libraries.data.libraries || [],
    fetchError: state.editor.libraries.fetchError,
    isFetching: state.editor.libraries.isFetching || state.editor.libraries.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
    editLibrary: (data: FormData) => dispatch(actions.editLibrary(data))
  };
}

const ConnectedLibraries = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Libraries);

export default ConnectedLibraries;