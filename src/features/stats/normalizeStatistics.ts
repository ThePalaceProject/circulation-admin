import { LibraryStatistics, StatisticsData } from "../../interfaces";

/**
 * Convert the fetched data from the sparse API format.
 * - Adds a list of collections to each library, one for each collectionId.
 * - Adds summary statistics in the form of a LibraryStatistics object.
 * @param statistics - Statistics data fetched via API.
 */
export const normalizeStatistics = (
  statistics: StatisticsData
): StatisticsData => {
  if (!statistics) {
    return statistics;
  }

  const collectionsById = statistics.collections.reduce(
    (map, collection) => ({ ...map, [collection.id]: collection }),
    {}
  );
  const libraries = statistics.libraries.map((l) => ({
    ...l,
    collections: l.collectionIds.map((id) => collectionsById[id]),
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
