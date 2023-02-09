import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ActionCreator from "../actions";
import { stateSelector as statsStateSelector } from "../reducers/stats";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { LibraryStatistics, StatisticsData } from "../interfaces";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import LibraryStats from "./LibraryStats";

export interface StatsLocalState {
  data?: StatisticsData;
  fetchError?: FetchErrorData;
  isLoaded?: boolean;
}


export interface StatsProps {
  library?: string;
}

/**
 * Displays statistics about patrons, licenses, and collections from the server.
 * If a library prop is provided, then statistics for that library will be displayed.
 * Otherwise, statistics for all authorized libraries will be displayed.
 * @param {StatsProps} props
 * @param {string} props.library - key (short name) of a library.
 * */
export const Stats = (props: StatsProps) => {
  const { library: targetLibraryKey } = props;
  const { data: statisticsData, fetchError, isLoaded } = useStatistics();

  const summaryStatistics = statisticsData?.summaryStatistics;
  const targetLibraryData = statisticsData?.libraries?.find(
    (library) => library.key === targetLibraryKey
  );

  return (
    <>
      {targetLibraryData && (
        <LibraryStats library={targetLibraryKey} stats={targetLibraryData} />
      )}
      {!targetLibraryData && summaryStatistics && (
        <LibraryStats stats={summaryStatistics} />
      )}
      {fetchError && <ErrorMessage error={fetchError} />}
      {!isLoaded && <LoadingIndicator />}
    </>
  );
};

/**
 * Convert the fetched data from the sparse API format.
 * - Adds a list of collections to each library, one for each collectionId.
 * - Adds summary statistics in the form of a LibraryStatistics object.
 * @param {StatisticsData} statistics - Statistics data fetched via API.
 */
export const normalizeStatistics = (statistics): StatisticsData => {
  if (!statistics) {
    return statistics;
  }

  const collectionIdMap = Object.assign(
    {},
    ...statistics.collections.map((c) => ({ [c.id]: c }))
  );
  const libraries = statistics.libraries.map((l) => ({
    ...l,
    collections: l.collectionIds.map((id) => collectionIdMap[id]),
  }));
  const collectionIds = statistics.collections.map((c) => c.id);

  const summaryStatistics: LibraryStatistics = {
    key: "_summary_",
    name: "Summary Statistics",
    patronStatistics: statistics.patronSummary,
    inventorySummary: statistics.inventorySummary,
    collectionIds,
    collections: statistics.collections,
  };

  return { ...statistics, libraries, summaryStatistics };
};

const useStatistics = (): StatsLocalState => {
  const data = useSelector(statsStateSelector.data);
  const isLoaded = useSelector(statsStateSelector.isLoaded);
  const fetchError = useSelector(statsStateSelector.fetchError);

  const dispatch = useDispatch();
  useEffect(() => {
    const actions = new ActionCreator();
    dispatch(actions.fetchStatistics());
  }, []);

  return { data: normalizeStatistics(data), fetchError, isLoaded };
};

export default Stats;
