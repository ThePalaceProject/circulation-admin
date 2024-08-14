import * as React from "react";
import { useState } from "react";
import {
  CollectionInventory,
  InventoryStatistics,
  LibraryStatistics,
  PatronStatistics,
} from "../interfaces";
import { Button } from "library-simplified-reusable-components";
import InventoryReportRequestModal from "./InventoryReportRequestModal";
import SingleStatListItem from "./SingleStatListItem";
import {
  useMayRequestInventoryReports,
  useMayViewCollectionBarChart,
} from "../businessRules/roleBasedAccess";
import StatsCollectionsBarChart from "./StatsCollectionsBarChart";
import StatsCollectionsList from "./StatsCollectionsList";
import StatsGroup from "./StatsGroup";
import StatsTotalCirculationsGroup from "./StatsTotalCirculationsGroup";
import StatsPatronGroup from "./StatsPatronGroup";
import StatsInventoryGroup from "./StatsInventoryGroup";
import StatsCollectionsGroup from "./StatsCollectionsGroup";

export interface LibraryStatsProps {
  stats: LibraryStatistics;
  library?: string;
}

export const inventoryKeyToLabelMap = {
  titles: "Titles",
  availableTitles: "Available Titles",
  openAccessTitles: "Open Access Titles",
  licensedTitles: "Licensed Titles",
  unlimitedLicenseTitles: "Unlimited License Titles",
  meteredLicenseTitles: "Metered License Titles",
  meteredLicensesOwned: "Metered Licenses Owned",
  meteredLicensesAvailable: "Metered Licenses Available",
  selfHostedTitles: "Self-Hosted Titles",
};

export const ALL_LIBRARIES_HEADING = "Dashboard for All Authorized Libraries";

/** Displays statistics about patrons, licenses, and collections from the server,
 for a single library or all libraries the admin has access to. */
const LibraryStats = ({ stats, library }: LibraryStatsProps) => {
  const {
    name: libraryName,
    key: libraryKey,
    collections,
    inventorySummary: inventory,
    patronStatistics: patrons,
  } = stats || {};

  const showBarChart = useMayViewCollectionBarChart({ library });
  const inventoryReportRequestEnabled = useMayRequestInventoryReports({
    library,
  });
  const dashboardTitle = library
    ? `${libraryName || libraryKey} Dashboard`
    : ALL_LIBRARIES_HEADING;
  const libraryOrLibraries = library ? "library's" : "libraries'";
  return (
    <div className="library-stats">
      <h2>{dashboardTitle}</h2>
      <ul className="stats">
        <li className="stat-group">
          <StatsPatronGroup
            withActiveLoan={patrons.withActiveLoan}
            withActiveLoanOrHold={patrons.withActiveLoanOrHold}
            heading="Current Circulation Activity"
            description="Real-time patron circulation information of the Palace System."
          />
        </li>
        <li className="stat-group">
          <StatsTotalCirculationsGroup
            {...patrons}
            heading="Circulation Totals"
          />
        </li>
        <li className="stat-group">
          <StatsInventoryGroup
            library={library}
            inventory={inventory}
            inventoryReportsEnabled={inventoryReportRequestEnabled}
          />
        </li>
        <li className="stat-group stat-group-wide">
          <StatsCollectionsGroup
            heading={"Configured Collections"}
            description={`
              The following collections are configured in your ${libraryOrLibraries}
              implementation of the Palace system and are available to your users
              through the Palace app.
            `}
            collections={collections}
            showBarChart={showBarChart}
          />
        </li>
      </ul>
    </div>
  );
};

export default LibraryStats;
