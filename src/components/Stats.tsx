import * as React from "react";
import { useGetStatsQuery } from "../features/stats/statsSlice";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import LibraryStats from "./LibraryStats";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export interface StatsProps {
  library?: string;
}

/**
 * Displays statistics about patrons, licenses, and collections from the server.
 * If a library prop is provided, then statistics for that
 * library will be displayed.
 * Otherwise, statistics for all authorized libraries will be displayed.
 * @param {StatsProps} props
 * @param {string} props.library - key (short name) of a library.
 * */
export const Stats = (props: StatsProps) => {
  const { library: targetLibraryKey } = props;
  const { data: statisticsData, error, isLoading } = useGetStatsQuery();
  // TODO: This is to overcome a type inference problem with a RTKQ hook.
  const fetchError = error as FetchErrorData;
  console.log("useGetStatsQuery response:", {
    statisticsData,
    fetchError,
    isLoading,
  });

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
      {error && <ErrorMessage error={fetchError} />}
      {isLoading && <LoadingIndicator />}
    </>
  );
};

export default Stats;
