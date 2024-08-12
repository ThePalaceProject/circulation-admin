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
  return (
    <div className="library-stats">
      <h2>{dashboardTitle}</h2>
      <ul className="stats">
        <li className="stat-group">{renderPatronsGroup(patrons)}</li>
        <li className="stat-group">{renderCirculationsGroup(patrons)}</li>
        <li className="stat-group">
          {renderInventoryGroup(
            inventory,
            inventoryReportRequestEnabled,
            library
          )}
        </li>
        <li className="stat-group stat-group-wide">
          {renderConfiguredCollections(collections, showBarChart)}
        </li>
      </ul>
    </div>
  );
};

const renderPatronsGroup = (patrons: PatronStatistics) => {
  return (
    <>
      <div>
        <h3>
          <span className="stat-grouping-label">Patrons</span>
        </h3>
        <div className="stat-group-description">
          Patrons currently registered in Palace
        </div>
      </div>
      <ul>
        <SingleStatListItem
          label="Total Patrons"
          value={patrons.total}
          tooltip="Total number of patrons."
        />
        <SingleStatListItem
          label="Patrons With Active Loans"
          value={patrons.withActiveLoan}
          tooltip="Number of patron with at least one active loan."
        />
        <SingleStatListItem
          label="Patrons With Active Loans or Holds"
          value={patrons.withActiveLoanOrHold}
          tooltip="Number of patrons with at least one active loan or at least one hold."
        />
      </ul>
    </>
  );
};

const renderCirculationsGroup = (patrons: PatronStatistics) => {
  const description =
    "The following circulation data displays real-time usage of the Palace system.";
  return (
    <>
      <div>
        <h3>
          <span className="stat-grouping-label">Circulation</span>
        </h3>
        <div className="stat-group-description">
          The following circulation data displays real-time usage of the Palace
          system.
        </div>
      </div>
      <ul>
        <SingleStatListItem
          label="Active Loans"
          value={patrons.loans}
          tooltip="Total number of active loans for all patrons."
        />
        <SingleStatListItem
          label="Active Holds"
          value={patrons.holds}
          tooltip="Total number of active holds for all patrons."
        />
      </ul>
    </>
  );
};

const renderInventoryGroup = (
  inventory: InventoryStatistics,
  inventoryReportsEnabled: boolean,
  library?: string
) => {
  const [showReportForm, setShowReportForm] = useState(false);

  return (
    <>
      {inventoryReportsEnabled && library && (
        <InventoryReportRequestModal
          show={showReportForm}
          onHide={() => setShowReportForm(false)}
          library={library}
        />
      )}
      <div>
        <h3>
          <span className="stat-grouping-label">Inventory</span>
          {inventoryReportsEnabled && library && (
            <Button
              callback={(() => setShowReportForm(true)) as any}
              content="⬇︎"
              title="Request an inventory report"
              style={{
                borderRadius: "50%",
                marginLeft: "10px",
                marginBottom: "0",
                marginTop: "-0.7rem",
              }}
              className="inline small"
              disabled={showReportForm}
            />
          )}
        </h3>
        <div className="stat-group-description">Real-time item inventory.</div>
      </div>
      <ul>
        <SingleStatListItem
          label={inventoryKeyToLabelMap.titles}
          value={inventory.titles}
          tooltip="Total number of books."
        />
        <SingleStatListItem
          label={inventoryKeyToLabelMap.availableTitles}
          value={inventory.availableTitles}
          tooltip="Number of books available for lending."
        />
        <SingleStatListItem
          label={inventoryKeyToLabelMap.meteredLicenseTitles}
          value={inventory.meteredLicenseTitles}
          tooltip="Number of books with a metered (counted) license."
        />
        <SingleStatListItem
          label={inventoryKeyToLabelMap.unlimitedLicenseTitles}
          value={inventory.unlimitedLicenseTitles}
          tooltip="Number of books for which there is no limit on the number of loans."
        />
        <SingleStatListItem
          label={inventoryKeyToLabelMap.openAccessTitles}
          value={inventory.openAccessTitles}
          tooltip="Number of books for which there are no limits on use."
        />
      </ul>
    </>
  );
};

const renderConfiguredCollections = (
  collections: CollectionInventory[],
  showBarchart: boolean
) => {
  const content =
    collections.length === 0 ? (
      <span className="no-collections">No associated collections.</span>
    ) : showBarchart ? (
      <StatsCollectionsBarChart collections={collections} />
    ) : (
      <StatsCollectionsList collections={collections} />
    );
  return (
    <>
      <div>
        <h3>
          <span className="stat-grouping-label">Configured Collections</span>
        </h3>
        <div className="stat-group-description">
          The following collections are configured in your library's
          implementation of the Palace system and are available to your users
          through the Palace app.
        </div>
      </div>
      {content}
    </>
  );
};

export default LibraryStats;
