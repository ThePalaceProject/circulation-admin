import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { StatsData, LibrariesData, LibraryData } from "../interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import LibraryStats from "./LibraryStats";

export interface StatsStateProps {
  stats?: StatsData;
  libraries?: LibraryData[];
  fetchError?: FetchErrorData;
  isLoaded?: boolean;
}

export interface StatsDispatchProps {
  fetchStats?: () => Promise<StatsData>;
  fetchLibraries?: () => Promise<LibrariesData>;
}

export interface StatsOwnProps {
  store?: Store<State>;
  library?: string;
}

export interface StatsProps extends StatsStateProps, StatsDispatchProps, StatsOwnProps {}

/** Displays statistics about patrons, licenses, and vendors from the server. */
export class Stats extends React.Component<StatsProps, void> {
  render(): JSX.Element {
    let libraryData: LibraryData | null = null;
    for (const library of this.props.libraries || []) {
      if (this.props.library && (library.short_name === this.props.library)) {
        libraryData = library;
      }
    }

    if (!libraryData && this.props.libraries && this.props.libraries.length === 1) {
      libraryData = this.props.libraries[0];
    }

    let libraryStats = this.props.isLoaded && this.props.stats && libraryData && this.props.stats[libraryData.short_name];
    const totalStats = this.props.isLoaded && this.props.libraries && this.props.libraries.length > 1 && this.props.stats && this.props.stats["total"];

    return (
      <div>
        { libraryStats &&
          <LibraryStats library={libraryData} stats={libraryStats} />
        }
        { totalStats &&
          <LibraryStats stats={totalStats} />
        }
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }

        { !this.props.isLoaded &&
          <LoadingIndicator />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.fetchStats) {
      this.props.fetchStats();
    }
    if (this.props.fetchLibraries()) {
      this.props.fetchLibraries();
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    stats: state.editor.stats.data,
    libraries: state.editor.libraries && state.editor.libraries.data && state.editor.libraries.data.libraries,
    fetchError: state.editor.stats.fetchError,
    isLoaded: state.editor.stats.isLoaded
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchStats: () => dispatch(actions.fetchStats()),
    fetchLibraries: () => dispatch(actions.fetchLibraries())
  };
}

const ConnectedStats = connect<StatsStateProps, StatsDispatchProps, StatsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Stats);

export default ConnectedStats;
