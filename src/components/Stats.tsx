import * as React from "react";
import { useEffect } from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { StatsData, LibrariesData, LibraryData } from "../interfaces";
import { RootState } from "../store";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
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
  store?: Store<RootState>;
  library?: string;
}

export interface StatsProps
  extends StatsStateProps,
    StatsDispatchProps,
    StatsOwnProps {}

/** Displays statistics about patrons, licenses, and vendors from the server. */
export const Stats = (props: StatsProps) => {
  let libraryData: LibraryData | null = null;
  for (const library of props.libraries || []) {
    if (props.library && library.short_name === props.library) {
      libraryData = library;
    }
  }

  if (!libraryData && props.libraries && props.libraries.length === 1) {
    libraryData = props.libraries[0];
  }

  const libraryStats =
    props.isLoaded &&
    props.stats &&
    libraryData &&
    props.stats[libraryData.short_name];
  const totalStats =
    props.isLoaded &&
    props.libraries &&
    props.libraries.length > 1 &&
    props.stats &&
    props.stats["total"];

  useEffect(() => {
    if (props.fetchStats) {
      props.fetchStats();
    }
    if (props.fetchLibraries()) {
      props.fetchLibraries();
    }
  }, []);

  return (
    <>
      {libraryStats && (
        <LibraryStats library={libraryData} stats={libraryStats} />
      )}
      {totalStats && <LibraryStats stats={totalStats} />}
      {props.fetchError && <ErrorMessage error={props.fetchError} />}

      {!props.isLoaded && <LoadingIndicator />}
    </>
  );
};

function mapStateToProps(state, ownProps) {
  return {
    stats: state.editor.stats.data,
    libraries:
      state.editor.libraries &&
      state.editor.libraries.data &&
      state.editor.libraries.data.libraries,
    fetchError: state.editor.stats.fetchError,
    isLoaded: state.editor.stats.isLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = new ActionCreator();
  return {
    fetchStats: () => dispatch(actions.fetchStats()),
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
  };
}

const ConnectedStats = connect<
  StatsStateProps,
  StatsDispatchProps,
  StatsOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(Stats);

export default ConnectedStats;
